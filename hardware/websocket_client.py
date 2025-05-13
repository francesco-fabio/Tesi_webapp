import usocket
import ubinascii
import urandom
import ustruct as struct
import uselect

class WebsocketClient:
    def __init__(self, url):
        self.url = url
        self.host = url.replace("ws://", "").split("/")[0].split(":")[0]
        self.port = 3000  # Cambia se il server WebSocket usa una porta diversa
        self.socket = None
        self.connect()

    def connect(self):
        print("🔄 Connessione a WebSocket:", self.url)
        self.socket = usocket.socket(usocket.AF_INET, usocket.SOCK_STREAM)
        self.socket.connect((self.host, self.port))

        # Handshake WebSocket
        handshake = (
            "GET / HTTP/1.1\r\n"
            f"Host: {self.host}:{self.port}\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9YZrdWw==\r\n"
            "Sec-WebSocket-Version: 13\r\n\r\n"
        )

        self.socket.send(handshake.encode())

        # Attendi la risposta del server
        response = self.socket.recv(1024)
        if b"101 Switching Protocols" not in response:
            raise Exception("❌ Errore nel handshake WebSocket")
        print("✅ Connessione WebSocket stabilita!")

    def send(self, message):
        """Invia un messaggio JSON al server WebSocket con mascheratura corretta."""
        msg = message.encode()
        length = len(msg)

        # Genera una maschera casuale (4 byte)
        mask = urandom.getrandbits(32).to_bytes(4, "big")

        # Maschera il payload
        masked_msg = bytes(b ^ mask[i % 4] for i, b in enumerate(msg))

        # Costruisce il frame WebSocket
        frame = bytearray()
        frame.append(0x81)  # Frame finale + opcode "testo"
        
        if length <= 125:
            frame.append(0x80 | length)  # Maschera + lunghezza
        elif length < 65536:
            frame.append(0x80 | 126)
            frame.extend(struct.pack(">H", length))  # 2 byte per la lunghezza
        else:
            frame.append(0x80 | 127)
            frame.extend(struct.pack(">Q", length))  # 8 byte per la lunghezza
        
        frame.extend(mask)  # Aggiunge la maschera
        frame.extend(masked_msg)  # Aggiunge i dati mascherati

        self.socket.send(frame)

    def recv(self):
        """Riceve un messaggio dal server WebSocket."""
        try:
            self.socket.recv(2)  # Ignora l'header WebSocket
            length = ord(self.socket.recv(1)) & 127
            return self.socket.recv(length).decode()
        except Exception:
            return None

    async def recv_async(self, timeout_ms=5000):
        """Riceve dati in modo asincrono usando polling."""
        try:
            poller = uselect.poll()
            poller.register(self.socket, uselect.POLLIN)
            
            if poller.poll(timeout_ms):
                self.socket.recv(2)  # Ignora header
                length = ord(self.socket.recv(1)) & 127
                return self.socket.recv(length).decode()
        except Exception as e:
            print("❌ Errore recv_async:", e)
        return None
    
    def close(self):
        """Chiude la connessione WebSocket."""
        if self.socket:
            self.socket.close()
            print("🔌 WebSocket chiuso")
