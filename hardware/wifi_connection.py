import network
import time

def connect_wifi(SSID, PASSWORD):
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(SSID, PASSWORD)
    
    while not wlan.isconnected():
        time.sleep(1)
        print("🔄 Connessione in corso...")

    print("✅ Connesso al Wi-Fi:", wlan.ifconfig())