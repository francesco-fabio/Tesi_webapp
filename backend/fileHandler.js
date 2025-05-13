/*
classe per la gestione della scrittura del file csv
*/
const fs = require("fs");
const { once } = require("events");

class FileHandler {
  constructor(filePath) {
    this.filePath = filePath;
    this.writableStream = null;
  }

  async init() {
    try {
      this.writableStream = fs.createWriteStream(this.filePath);

      // Attendi che lo stream sia pronto o fallisca
      await Promise.race([
        once(this.writableStream, "open"), // success
        once(this.writableStream, "error").then(([err]) => {
          throw err;
        }), // errore
      ]);
    } catch (error) {
      console.error(
        `Errore durante l'inizializzazione dello stream: ${error.message}`
      );
      throw error;
    }
  }

  async write(content) {
    if (!this.writableStream) {
      throw new Error(
        "Stream non inizializzato. Chiama init() prima di scrivere."
      );
    }

    return new Promise((resolve, reject) => {
      this.writableStream.write(`${content}\n`, (err) => {
        if (err) {
          console.error(`Errore durante la scrittura: ${err.message}`);
          return reject(err);
        }
        resolve();
      });
    });
  }

  async close() {
    if (!this.writableStream) return;

    return new Promise((resolve, reject) => {
      this.writableStream.end(() => {
        resolve();
      });

      this.writableStream.on("error", (err) => {
        console.error(
          `Errore durante la chiusura dello stream: ${err.message}`
        );
        reject(err);
      });
    });
  }
}

module.exports = FileHandler;
