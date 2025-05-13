const WebSocket = require('ws');

let cicle = false;
let count = 0

console.log("mock sensor attivo")
let socket = new WebSocket("ws://localhost:3000");
socket.onopen = () => {
    console.log("WebSocket connected.");
};

function getRandomIntInclusive(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
  };
  
// simula la lettura dei valori e l'invio al server ad ogni secondo
function dataStream(){
    const interval = setInterval(() => {
      if (!cicle) {
          clearInterval(interval);
          return;
        }
    
      let spo2 = getRandomIntInclusive(89, 100);
      let hr = getRandomIntInclusive(60, 120);
   
      let data = {
          "hr": hr,
          "spo2": spo2,
          "sender": "sensor"
      };
      console.log(data);
    
      socket.send(JSON.stringify(data)); // Assicurati di inviare una stringa JSON
      console.log("dati inviati");
    
    }, 1000);
}



// Messaggio ricevuto
socket.onmessage = function(event) {
    console.log('messaggio ricevuto')
    let message = JSON.parse(event.data);
    console.log(message);
    cicle = message.stream == 'true'
    if(cicle){//quando clicco rec il messaggio viene dal client, cicle 0 ancora true e dataStream viene eseguita di nuovo
        ++count
        if(count == 1){
            dataStream()
        }
    }
    else{
        count = 0
    }
};