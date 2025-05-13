/*
classe che si occupa di gestire il caricamento dei dati
dal file csv al database mysql

*/
const fs = require("fs");
const csv = require("csv-parser");
const mysql = require("mysql2/promise");
const config = require("config");

class csvImporter {
  constructor(tmStmp) {
    this.tmStmp = tmStmp;
    this.csvPath = `./files/rec_${tmStmp}.csv`;
    this.table = config.get("table");
    this.batchSize = config.get("batchSize");
    this.dbConfig = {
      host: config.get("dbConfig.host"),
      user: config.get("dbConfig.user"),
      password: config.get("dbConfig.password"),
      database: config.get("dbConfig.database"),
      port: config.get("dbConfig.port"),
    };
    this.buffer = [];
  }

  /* inizializzazione della connessione
  nel caso in cui il database o la tabella non esistano, vengono create
  */
  async init() {
    try {
      this.connection = await mysql.createConnection(this.dbConfig);
      console.log("✅ Connessione al DB riuscita.");
    } catch (err) {
      if (err.errno == 1049) {
        this.connection = await mysql.createConnection({
          host: config.get("dbConfig.host"),
          user: config.get("dbConfig.user"),
          password: config.get("dbConfig.password"),
          port: config.get("dbConfig.port"),
        });
        const dbQuery = `CREATE DATABASE IF NOT EXISTS ${this.dbConfig.database}`;
        try {
          await this.connection.execute(dbQuery);
          console.log(`📥 database creato`);
          await this.connection.end();
        } catch (err) {
          console.error("❌ con la verifica esistenza del database", err);
        } finally {
          this.connection = await mysql.createConnection(this.dbConfig);
        }
      }
    }

    const tableQuery = `CREATE TABLE IF NOT EXISTS ${this.table} (
      id int NOT NULL AUTO_INCREMENT,
      spo2 int NOT NULL,
      hr int NOT NULL,
      date datetime NOT NULL,
      file_name varchar(50) NOT NULL,
      PRIMARY KEY (id)
      );`;

    try {
      await this.connection.execute(tableQuery);
      console.log(`📥 verifica esistenza tabella.`);
    } catch (err) {
      console.error("❌ errore nella verica esistenza della tabella:", err);
    }
  }

  // metodo per adattare il formato del timestamp
  parseCsvDate(csvDateString) {
    return csvDateString.replace(/(\d{2})-(\d{2})-(\d{2})$/, "$1:$2:$3");
  }

  /*
  per ridurre il numero di insert nel database
  vengono prelevate e caricate un numero n (dimensione del batch definibile
  nel file di configurazione) per volta
  */
  async insertBatch(batch) {
    if (batch.length === 0) return;

    const placeholders = batch.map(() => "(?, ?, ?, ?)").join(", ");
    const flatValues = batch.flat();

    const query = `INSERT INTO ${this.table} (spo2, hr, date, file_name) VALUES ${placeholders}`;

    try {
      await this.connection.execute(query, flatValues);
      console.log(`📥 Inserito batch da ${batch.length} record.`);
    } catch (err) {
      console.error("❌ Errore durante insertBatch:", err);
    }
  }

  // metodo che gestisce l'intesimento dei dati del file csv nel database
  async import() {
    await this.init();

    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(this.csvPath).pipe(csv());
      let isPaused = false;

      const resumeIfNeeded = () => {
        if (isPaused) {
          stream.resume();
          isPaused = false;
        }
      };

      stream.on("data", async (row) => {
        console.log(`${row.spo2}, ${row.hr}, ${row.time}, ${row.file_name}`);
        this.buffer.push([
          row.spo2,
          parseInt(row.hr),
          this.parseCsvDate(row.time),
          row.file_name,
        ]);

        if (this.buffer.length >= this.batchSize) {
          stream.pause();
          isPaused = true;
          const batch = this.buffer.splice(0, this.batchSize);
          await this.insertBatch(batch);
          resumeIfNeeded();
        }
      });

      stream.on("end", async () => {
        if (this.buffer.length > 0) {
          await this.insertBatch(this.buffer);
        }
        await this.connection.end();
        console.log("✅ Importazione completata.");
        resolve();
      });

      stream.on("error", (err) => {
        console.error("❌ Errore nello stream CSV:", err);
        reject(err);
      });
    });
  }
}

module.exports = csvImporter;
