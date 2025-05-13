const express = require("express");
const dbManager = require("../utils/dbManager");

const router = express.Router();

// equivale ad ottenere il nome del file csv
router.get("/filename", async (req, res) => {
  const db = new dbManager();
  try {
    const data = await db.getFileNames();
    res.status(200).json(data);
  } catch (err) {
    console.error("Errore durante l'importazione:", err);
  }
});

//restituisce spo2 e hr sulla base della specifica registrazione richiesta
router.get("/file/:name", async (req, res) => {
  const name = req.params.name;
  const db = new dbManager();
  try {
    const data = await db.getRecordingData(name);
    res.status(200).json(data);
  } catch (err) {
    console.error("Errore durante l'importazione:", err);
  }
});

// restituisce il il totale delle occorrenze di ogni valore di spo2
router.get("/spo2-count/:name", async (req, res) => {
  const name = req.params.name;
  const db = new dbManager();
  try {
    const data = await db.getSpo2Count(name);
    res.status(200).json(data);
  } catch (err) {
    console.error("Errore durante l'importazione:", err);
  }
});

// restituisce il il totale delle occorrenze di ogni valore di hr
router.get("/hr-count/:name", async (req, res) => {
  const name = req.params.name;
  const db = new dbManager();
  try {
    const data = await db.getHrCount(name);
    res.status(200).json(data);
  } catch (err) {
    console.error("Errore durante l'importazione:", err);
  }
});

// restituisce la media di spo2 e hr della singola registrazione
router.get("/avg/:name", async (req, res) => {
  const name = req.params.name;
  const db = new dbManager();
  try {
    const data = await db.getAvg(name);
    res.status(200).json(data);
  } catch (err) {
    console.error("Errore durante l'importazione:", err);
  }
});

module.exports = router;
