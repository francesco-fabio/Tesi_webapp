const button = document.getElementById("activator");
const text = document.getElementById("tex");
const check = document.getElementById("record");
const spo2 = document.getElementById("spo2");
const hr = document.getElementById("hr");
const rec = document.getElementById("record");

console.log("script in esecuzione");

let socket = new WebSocket("ws://localhost:3000", "client");
let msg = {
  stream: "false",
  rec: "false",
  sender: "client",
};

socket.onopen = () => {
  console.log("WebSocket connected.");

  button.addEventListener("click", () => {
    console.log("eseguito");
    if (button.textContent == "Start") {
      button.textContent = "Pause";
      msg.stream = "true";
      socket.send(JSON.stringify(msg));
      console.log("stream attivato");
      check.disabled = false;
    } else {
      button.textContent = "Start";
      msg.stream = "false";
      socket.send(JSON.stringify(msg));
      console.log("stream disattivato");
      check.disabled = true;
    }
  });

  check.addEventListener("change", (e) => {
    if (e.target.checked) {
      msg.rec = "true";
      socket.send(JSON.stringify(msg));
      console.log("registrazione avviata");
      button.disabled = true;
    } else {
      msg.rec = "false";
      socket.send(JSON.stringify(msg));
      console.log("registrazione stoppata");
      button.disabled = false;
    }
  });

  window.onbeforeunload = function(event) {
    msg.stream = "false";
    msg.rec = "false"
    socket.send(JSON.stringify(msg));
  };
};

// messaggio ricevuto - mostra il messaggio su div#messages
socket.onmessage = function (event) {
  let message = JSON.parse(event.data);
  console.log(message);
  if (message.sender == "sensor") {
    spo2.textContent = message.spo2 ? message.spo2 : "NaN";
    hr.textContent = message.hr ? message.hr : "NaN";
    rec.textContent = message.rec ? message.rec : "NaN";
  }
};

