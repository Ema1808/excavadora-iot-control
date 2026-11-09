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

### Evidencia 14.4 — Diagnóstico de conexión WebSocket (WSS)

**Fecha:** 9 de noviembre de 2026  
**Proyecto:** Excavadora IoT  
**Vehículo:** ID 7  
**Resultado:** Conexión WSS y recepción de eventos pendientes de verificación.

**Procedimiento:**

1. Se revisó el archivo `js/services/websocket.service.js`.
2. Se comprobó que el servicio implementa los eventos `open`, `message`, `error` y `close`.
3. Se revisó `js/config/api.config.js`, donde se encontró `wsUrl: null`.
4. Se buscó en `js/main.js` una llamada a `websocketController.connect()`, sin encontrar coincidencias.
5. Se descargó y analizó la documentación OpenAPI del servidor FastAPI.
6. Se comprobó que la documentación obtenida no describe el mecanismo de autenticación WebSocket.
7. Se consideró el resultado de una prueba anterior, en la que el establecimiento de una conexión WSS sin autenticación recibió HTTP 403.

**Resultados:**

- El servicio WebSocket está implementado en JavaScript.
- La conexión WSS se encuentra deshabilitada por configuración.
- El frontend no contiene una llamada identificada para iniciar dicha conexión.
- No se ha confirmado una sesión WebSocket autenticada.
- No se han recibido eventos verificables correspondientes a cambios de dirección o DETENER.

**Conclusión:**

Se realizó el diagnóstico del módulo WebSocket y se identificaron las condiciones que impiden verificar la comunicación en tiempo real. La aplicación cuenta con la estructura necesaria para gestionar conexiones y mensajes WSS, pero requiere conocer el mecanismo de autenticación del backend antes de habilitarla.

La evidencia demuestra el análisis técnico realizado, pero no acredita la recepción de eventos WebSocket ni la ejecución física de movimientos.

### Evidencia 14.6 — Monitoreo de conectividad y recuperación HTTP

**Fecha:** 9 de noviembre de 2026  
**Entorno:** Frontend local `http://127.0.0.1:5500`  
**Herramientas:** Chrome DevTools, pestaña Network.

**Prueba 1. Disponibilidad de FastAPI**

Se verificó que el indicador del servidor AWS mostraba «Disponible (GET comandos)». En Network se observaron respuestas HTTP 200 de las consultas de comandos, demostraciones y estado del vehículo.

**Resultado:** SUPERADA.

**Prueba 2. Simulación de pérdida de conexión**

Se configuró Chrome DevTools en modo Offline. Durante la siguiente comprobación de conectividad, una solicitud HTTP falló y la interfaz mostró «Error de conexión».

**Resultado:** SUPERADA.

**Prueba 3. Recuperación de conexión**

Se restauró la configuración No throttling. La interfaz volvió a mostrar «Disponible (GET comandos)» y se observaron nuevas respuestas HTTP 200.

**Resultado:** SUPERADA.

**Estado de WebSocket WSS**

El indicador permaneció desconectado porque la conexión autenticada todavía no está configurada. No se verificaron eventos WebSocket de apertura, cierre o recuperación.

**Estado de Amazon RDS**

El indicador permaneció en «Sin verificar». Las respuestas exitosas de FastAPI no constituyen una comprobación directa de disponibilidad de Amazon RDS.

**Conclusión**

El frontend detecta correctamente la pérdida y recuperación de comunicación HTTP con FastAPI. La interrupción se simuló mediante Chrome DevTools, sin provocar una caída real del servidor AWS. Las comprobaciones de conexión WSS autenticada y disponibilidad directa de Amazon RDS permanecen pendientes.

**Evidencias gráficas:** Capturas del estado disponible, fallo HTTP en modo Offline y recuperación con No throttling.