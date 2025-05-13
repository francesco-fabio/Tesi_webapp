const express = require("express");
const routes = require("./routes/routes");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/charts", routes);

app.listen(3001);

console.log("✅ Server API in ascolto su http://localhost:3001");
