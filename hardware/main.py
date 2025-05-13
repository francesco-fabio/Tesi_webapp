import uasyncio as asyncio
import ujson
import array as arr
from wifi_connection import connect_wifi
from websocket_client import WebsocketClient
from sensor_controller import SensorController

stream = False
dati = arr.array('i',[0,0,0])

async def look_for_received_msg():
    global stream
    while True:
        rep = await ws.recv_async()
        if rep is not None:
            msg = ujson.loads('{' + rep)
            stream = msg.get("stream") == "true"
            print("📩 Ricevuto:", msg)
        await asyncio.sleep(0.5)

async def send_data():
    global stream
    global dati
    
    while True:
        if stream:
            # Crea il JSON con i dati del sensore
            data = {
                "hr": dati[1],
                "spo2": dati[0],
                "sender": "sensor"
            }
            ws.send(ujson.dumps(data))
            print("📡 Dati inviati:", data)
        await asyncio.sleep(1)
    
async def get_data():
    global dati
    #global sensor
    while True:
        sensor.get_spO2(dati)
        if dati[2] == 1:
            spo2 = dati[0]
            hr = dati[1]
            dati[2] = 0
            print(f"SpO2={dati[0]}, HR={dati[1]}")

        await asyncio.sleep(0.001)

async def main():
    asyncio.create_task(look_for_received_msg())
    asyncio.create_task(send_data())
    asyncio.create_task(get_data())

#add the credencials
SSID = ""
PASSWORD = ""

#Inizializza il sensore
sensor = SensorController()

connect_wifi(SSID, PASSWORD)

#add the endpoint
SERVER_URL = "ws://address:port"

try:
    ws = WebsocketClient(SERVER_URL)
    print("✅ Connesso al WebSocket server")

    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
    loop.run_forever()

except Exception as e:
    print("❌ Errore:", e)

finally:
    #insert here a disconnect message to tell that the sensor is offline
    ws.close()
    print("🔌 Connessione WebSocket chiusa")
