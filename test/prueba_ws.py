
import asyncio
import getpass
import json
from websockets.asyncio.client import connect

URL = "wss://excavadora-em-iot.duckdns.org/ws/vehiculos/7"

async def main():
    print("=== PRUEBA WEBSOCKET EXCAVADORA IoT ===")

    api_key = getpass.getpass("Introduce tu X-API-Key: ")

    try:
        async with connect(
            URL,
            additional_headers={"x-api-key": api_key},
            open_timeout=15,
            ping_interval=20
        ) as ws:

            print("\nWebSocket conectado correctamente.")
            print("Esperando eventos de FastAPI...\n")

            async for mensaje in ws:
                try:
                    evento = json.loads(mensaje)
                    print(json.dumps(
                        evento,
                        indent=2,
                        ensure_ascii=False
                    ))
                except json.JSONDecodeError:
                    print("Mensaje recibido:", mensaje)

    except Exception as error:
        print("\nError de conexión:", error)

if __name__ == "__main__":
    asyncio.run(main())
