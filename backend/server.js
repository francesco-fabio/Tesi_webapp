/*
- gestisce la comunicazione tra il microcontrollore e il front-end tramite un socket.
- quando la registrazione è attiva memorizza i dati su un file csv
- quando la registrazione termina, carica il file csv su un database mysql

*/

const WebSocket = require("ws");
const fileHandler = require("./fileHandler.js");
const csvImporter = require("./csvImporter");

const clients = new Set();

// template base dei messaggi che vengono scambiati tra microcontrollore e frontend
let template = {
  spo2: "",
  hr: "",
  stream: "",
  rec: "",
  sender: "",
};
let rec = false;
let recSwitchedOn = true;
let fh;
let tmStmp;
let loadToDb = false;

const timestamp = () => {
  const d = new Date();
  const date = d.toISOString().split("T")[0];
  const time = d.toTimeString().split(" ")[0].replace(/:/g, "-");
  return `${date} ${time}`;
};

// creazione del websocket
const wss = new WebSocket.Server({ port: 3000 });

wss.on("connection", (ws, req) => {
  // distinguo il microcontrollore dal client
  if (req.headers["sec-websocket-protocol"]) {
    console.log(`benvenuto: ${req.headers["sec-websocket-protocol"]}`);
    clients.add({ client: ws, type: "client" });
  } else {
    console.log("nuovo sensore connesso!");
    clients.add({ client: ws, type: "sensor" });
  }

  // gestione delle operazioni alla ricezione del messaggio
  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);
      template.sender = data.sender;

      // differenzia il comportamento in base al mittente del messaggio
      if (data.sender == "sensor") {
        template.spo2 = data.spo2;
        template.hr = data.hr;
        // invia i dati del sensore al client frontend
        for (let client of clients) {
          if (client.type == "client") {
            client.client.send(JSON.stringify(template));
          }
        }

        // gestione della registrazione
        if (rec) {
          // recSwitchedOn serve a determinare il cambiamento di stato del flag "rec"
          if (recSwitchedOn) {
            recSwitchedOn = false;
            tmStmp = timestamp();
            // creo il file usando un timestamp come identificatore univoco
            fh = new fileHandler(`./files/rec_${tmStmp}.csv`);
            loadToDb = true; //flag che aiuta a stabilire quando bisogna caricarica il file sul database
            try {
              await fh.init(); // inizializzazione e scrittura dei campi
              await fh.write(`spo2,hr,time,file_name`);
            } catch (err) {
              console.error(`Errore nella gestione file: ${err.message}`);
            }
          }
          const content = `${template.spo2},${
            template.hr
          },${timestamp()},rec_${tmStmp.replace(/\s/g, "")}`;
          try {
            await fh.write(content); //scrittura nel file dei valori ricevuti dal sensore
          } catch (err) {
            console.error(`Errore nella gestione file: ${err.message}`);
          }
        } else {
          recSwitchedOn = true;
          if (typeof fh !== "undefined") {
            // terminata la fase di registrazione si caricano i dati del file sul db
            try {
              await fh.close();
              //insert data into db
              if (typeof tmStmp !== "undefined" && loadToDb == true) {
                (async () => {
                  const importer = new csvImporter(tmStmp);
                  try {
                    await importer.import();
                    loadToDb = false;
                  } catch (err) {
                    console.error("Errore durante l'importazione:", err);
                  }
                })();
              }
            } catch (err) {
              console.error(`Errore nella gestione file: ${err.message}`);
            }
          }
        }
      } else {
        if (data.rec == "true") {
          //gestione del flag per determinare se la registrazione è attiva o meno
          rec = true;
        } else {
          rec = false;
        }

        template.stream = data.stream;
        template.rec = data.rec;
        for (let client of clients) {
          if (client.type != "client") {
            client.client.send(JSON.stringify(template));
          }
        }
      }

      
      console.log(
        `📡 Dati ricevuti: SpO2: ${template.spo2}, HR: ${template.hr}, Stream: ${template.stream}, Rec: ${template.rec}, Sender: ${data.sender}`
      );
    } catch (error) {
      console.error("Errore nella ricezione dei dati:", error);
    }
  });

  ws.on("close", () => {
    for (let client of clients) {
      if (client.client == ws) {
        console.log(`${client.type} disconnesso`);
      }
    }
  });
});

console.log("✅ Server WebSocket in ascolto su ws://0.0.0.0:3000");
