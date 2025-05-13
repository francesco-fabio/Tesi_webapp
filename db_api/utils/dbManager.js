const mysql = require("mysql2/promise");
const config = require("config");

class dbManager {
  constructor() {
    this.table = config.get("table");
    this.dbConfig = {
      host: config.get("dbConfig.host"),
      user: config.get("dbConfig.user"),
      password: config.get("dbConfig.password"),
      database: config.get("dbConfig.database"),
      port: config.get("dbConfig.port"),
    };
  }

  async init() {
    this.connection = await mysql.createConnection(this.dbConfig);
    console.log("✅ Connessione al DB riuscita.");
  }

  async getFileNames() {
    await this.init();
    const query = `SELECT DISTINCT file_name FROM ${this.table}`;

    try {
      const [results, fields] = await this.connection.execute(query);
      return { success: true, results };
    } catch (err) {
      console.error("❌ Errore durante getFileNames:", err);
      return { status: "err", err };
    }
  }

  async getRecordingData(name) {
    await this.init();
    const query = `SELECT spo2, hr, date FROM ${this.table} WHERE file_name = "${name}"`;

    try {
      const [results, fields] = await this.connection.execute(query);
      return { success: true, results };
    } catch (err) {
      console.error("❌ Errore durante getFileNames:", err);
      return { status: "err", err };
    }
  }

  async getSpo2Count(name) {
    await this.init();
    const query = `SELECT file_name, spo2, count(spo2) FROM ${this.table} WHERE file_name = "${name}" GROUP BY spo2 ORDER BY spo2 ASC`;

    try {
      const [results, fields] = await this.connection.execute(query);
      return { success: true, results };
    } catch (err) {
      console.error("❌ Errore durante getFileNames:", err);
      return { status: "err", err };
    }
  }

  async getHrCount(name) {
    await this.init();
    const query = `SELECT file_name, hr, count(hr) FROM ${this.table} WHERE file_name = "${name}" GROUP BY hr ORDER BY hr ASC`;

    try {
      const [results, fields] = await this.connection.execute(query);
      return { success: true, results };
    } catch (err) {
      console.error("❌ Errore durante getFileNames:", err);
      return { status: "err", err };
    }
  }

  async getAvg(name) {
    await this.init();
    const query = `SELECT file_name, round(avg(spo2)) spo2_avg, round(avg(hr)) as hr_avg FROM ${this.table} WHERE file_name = "${name}" GROUP BY file_name`;

    try {
      const [results, fields] = await this.connection.execute(query);
      return { success: true, results };
    } catch (err) {
      console.error("❌ Errore durante getFileNames:", err);
      return { status: "err", err };
    }
  }
}

module.exports = dbManager;
