# Registro de pruebas - Excavadora IoT

## Actividad 4.1

### 1. Prueba local de movimientos

Herramienta: Node.js v24.20.0
Archivo: test/movement.test.js
Resultado: SUPERADA

Comandos utilizados:
- AVANZAR: ID 39
- GIRAR_DERECHA: ID 42
- DETENER: ID 47

Resultados observados:
- Orden procesado: [39, 47]
- AVANZAR: sustituido por DETENER.
- GIRAR_DERECHA: cancelado por DETENER.
- DETENER: completado correctamente.

Conclusion:
Se comprobo que DETENER tiene prioridad sobre
los movimientos pendientes en la cola simulada.

Esta prueba no envia solicitudes HTTP a AWS.

### 2. Prueba HTTP de FastAPI

Servidor:
https://excavadora-em-iot.duckdns.org

Endpoint:
POST /api/vehiculos/7/movimientos

Prueba realizada anteriormente:
- Comando: DETENER
- ID del comando: 47
- Origen: HTTP
- Respuesta observada: HTTP 200

Limitacion:
La aceptacion HTTP no demuestra movimiento fisico
ni publicacion de eventos WebSocket.

### 3. Prueba de GitHub Pages

URL:
https://ema1808.github.io/excavadora-iot-control/

Resultado:
- Interfaz publicada correctamente.
- Joystick funcional en simulacion.
- Controles de brazo y pala funcionales en simulacion.
- DETENER devuelve el control al estado neutral.
- Siete pruebas moviles reportadas como satisfactorias.

### 4. Prueba de CORS

Origen:
https://ema1808.github.io

Resultado observado:
HTTP 400 - Disallowed CORS origin

Conclusion:
El backend no permite actualmente las solicitudes
desde el origen de GitHub Pages.

### 5. Estado WebSocket

URL:
wss://excavadora-em-iot.duckdns.org/ws/vehiculos/7

Resultado:
- Conexion WSS no establecida.
- Se observo cierre 1006 en navegador.
- Una prueba de handshake sin autenticar devolvio HTTP 403.

No se verifico la publicacion de eventos WebSocket.

### 6. Amazon RDS

Estado: Sin verificar.

No se dispone de una prueba autorizada que confirme
directamente la conectividad con Amazon RDS.

### 7. Pruebas pendientes

- Movimiento iniciado en la pagina y recibido por FastAPI.
- Evento WebSocket correspondiente al movimiento.
- Cambio de direccion y DETENER mediante WSS.
- Inicio, secuencia y cancelacion de DEMO.
- Caida y recuperacion de conexiones.
- Integracion con excavadora fisica.
### Prueba HTTP POST del comando DETENER — Evidencia 14.3

**Fecha:** 9 de noviembre de 2026  
**Entorno:** Aplicación web local en `http://127.0.0.1:5500`  
**Herramienta:** Chrome DevTools, pestaña Network  
**Servidor:** FastAPI desplegado en AWS  
**Resultado:** SUPERADA para el registro HTTP del comando DETENER.

**Procedimiento:**

1. Se abrió la interfaz de Excavadora IoT desde localhost.
2. Se estableció una sesión de pruebas autenticada.
3. Se accionó el botón DETENER y se confirmó la operación.
4. Se verificó en Network la solicitud POST al endpoint `/api/vehiculos/7/movimientos`.
5. Se comprobó el cuerpo de la solicitud: `{"id_comando":47,"origen":"HTTP"}`.
6. Se obtuvo una respuesta HTTP 200 OK.

**Respuesta de FastAPI:**

```json
{
  "mensaje": "Movimiento registrado",
  "id_vehiculo": 7,
  "id_comando": 47,
  "codigo": 9
}
```

**Conclusión:** Se verificó que la interfaz local puede enviar el comando DETENER mediante HTTP POST y recibir la confirmación de registro de FastAPI. La excavadora física estuvo desconectada durante la prueba. No se comprobó ejecución física ni recepción de eventos WebSocket.

**Evidencias gráficas:** Capturas de Chrome DevTools correspondientes a Headers, Payload y Preview de la solicitud POST.