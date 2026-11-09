# Excavadora IoT — Panel de Control y Monitoreo

Proyecto de interfaz web para el control y monitoreo de una excavadora IoT, desarrollado con HTML5, CSS3, JavaScript modular y Bootstrap 5.

La aplicación permite visualizar el estado de conectividad, interactuar con controles de movimiento en modo simulación y consultar información de un backend FastAPI alojado en AWS, sujeto a las restricciones de autenticación y CORS del servidor.

## 1. Enlaces del proyecto

- **Aplicación publicada:** https://ema1808.github.io/excavadora-iot-control/
- **Repositorio GitHub:** https://github.com/Ema1808/excavadora-iot-control
- **Documentación Swagger:** https://excavadora-em-iot.duckdns.org/docs
- **API base:** https://excavadora-em-iot.duckdns.org

## 2. Tecnologías utilizadas

- HTML5 y CSS3
- JavaScript ES Modules
- Bootstrap 5
- Git y GitHub
- GitHub Pages
- API REST con FastAPI
- WebSocket seguro (WSS), integración pendiente
- AWS y Amazon RDS como infraestructura del backend

## 3. Funcionalidades implementadas

### Panel de control

- Interfaz adaptable a diferentes tamaños de pantalla.
- Joystick para movimientos direccionales.
- Control mediante flechas del teclado.
- Botones para subir y bajar el brazo.
- Botones para abrir y cerrar la pala.
- Botón DETENER.
- Historial de movimientos locales.
- Mensajes de actividad y estado.

Los movimientos de la interfaz publicada funcionan en **modo simulación**. No representan confirmación de movimiento físico.

### Demostraciones

- Interfaz para seleccionar demostraciones.
- Simulación de inicio y cancelación.
- Consulta del catálogo de demostraciones desde FastAPI cuando existe una sesión local autorizada.

La ejecución real de demostraciones desde la interfaz pública no está habilitada.

### Monitoreo

La aplicación presenta indicadores independientes para:

- Servidor AWS / FastAPI.
- Conexión WebSocket WSS.
- Amazon RDS.

El indicador de RDS permanece sin verificar mientras no exista un mecanismo de diagnóstico autorizado.

## 4. Arquitectura general

La arquitectura del proyecto comprende:

1. **Frontend:** interfaz web estática alojada en GitHub Pages.
2. **API REST:** backend FastAPI accesible mediante HTTPS.
3. **WebSocket:** canal WSS previsto para eventos en tiempo real.
4. **Base de datos:** Amazon RDS, administrada desde el backend.
5. **Vehículo IoT:** excavadora identificada con `id_vehiculo = 7`.

La publicación del frontend no implica que exista una conexión activa con el hardware físico.

## 5. Endpoints REST identificados

| Método | Endpoint | Propósito |
|---|---|---|
| GET | `/` | Comprobar respuesta básica de FastAPI |
| GET | `/api/vehiculos/7/comandos` | Consultar comandos |
| GET | `/api/vehiculos/7/demos` | Consultar demostraciones |
| GET | `/api/vehiculos/7/estado` | Consultar último estado registrado |
| POST | `/api/vehiculos/7/movimientos` | Registrar movimiento |
| POST | `/api/vehiculos/7/demo/iniciar` | Iniciar demostración |
| POST | `/api/vehiculos/7/demo/cancelar` | Cancelar demostración |

Los endpoints POST están documentados, pero su ejecución real no está habilitada en el frontend público.

## 6. Ejecución local

Abrir el proyecto en Visual Studio Code.

Iniciar Live Server o ejecutar:

```powershell
python -m http.server 5500
```

Abrir:

http://127.0.0.1:5500/index.html

La autenticación de pruebas está restringida a `localhost` y `127.0.0.1`.

La clave X-API-Key se introduce mediante el formulario de la aplicación y se mantiene temporalmente en memoria. No debe escribirse en el código fuente ni publicarse en GitHub.

## 7. Pruebas realizadas

| Prueba | Resultado |
|---|---|
| Publicación en GitHub | Completada |
| Despliegue mediante GitHub Pages | Completado |
| Carga de HTML, CSS y JavaScript | Verificada visualmente |
| Joystick y registro de actividad | Verificados en simulación |
| Prioridad de DETENER | Prueba local con simulación superada |
| Respuesta HTTPS de FastAPI | Confirmada |
| Consulta de catálogos REST desde entorno local | Probada |
| Acceso REST desde GitHub Pages | Bloqueado por CORS |
| Conexión WSS | Handshake no completado |
| Conexión directa con RDS | No verificada |
| Funcionamiento en teléfono físico | Pendiente de prueba |

## 8. Limitaciones identificadas

### CORS en GitHub Pages

La solicitud de comprobación CORS desde el origen:

`https://ema1808.github.io`

hacia:

`/api/vehiculos/7/comandos`

devolvió:

```text
HTTP/1.1 400 Bad Request
Disallowed CORS origin
```

El backend permite los métodos GET y POST y reconoce el encabezado X-API-Key, pero no autoriza actualmente el origen de GitHub Pages.

La corrección requiere acceso autorizado a la configuración CORS del backend FastAPI.

### WebSocket WSS

Se identificó la dirección:

`wss://excavadora-em-iot.duckdns.org/ws/vehiculos/7`

Las pruebas no consiguieron completar la conexión WebSocket.

Se requiere confirmar con el responsable del backend el mecanismo de autenticación y las restricciones de origen.

### Amazon RDS

No se dispone de un endpoint de diagnóstico que permita verificar de forma independiente el estado de Amazon RDS desde el frontend.

### Permisos AWS

El acceso a determinadas operaciones administrativas de AWS EC2 está restringido por políticas IAM.

El desarrollo del frontend no incluye permisos para modificar la infraestructura del servidor.

## 9. Consideraciones de seguridad

- Utilizar HTTPS para las consultas REST y WSS para WebSocket.
- No incluir claves privadas en el repositorio.
- No almacenar X-API-Key en `localStorage`.
- No enviar claves permanentes mediante parámetros de URL.
- No deshabilitar CORS en el navegador.
- Mantener los movimientos reales deshabilitados en la interfaz pública.
- Utilizar credenciales de prueba con privilegios mínimos.
- No considerar una respuesta REST exitosa como confirmación de movimiento físico.
- Recordar que las claves utilizadas en el navegador pueden observarse mediante las herramientas de desarrollo.

## 10. Estado del proyecto

**Frontend publicado y funcional en modo simulación.**

La integración completa con FastAPI desde GitHub Pages, la autenticación WSS y la verificación de Amazon RDS dependen de configuraciones del backend que actualmente no están disponibles para el desarrollador del frontend.

## 11. Autor

**Emanuel Gonzalez**

Ingeniería en Sistemas Computacionales

2026
## Pruebas de funcionamiento en dispositivo móvil

Fecha: 9 de noviembre de 2026
Entorno: GitHub Pages, navegador móvil
URL: https://ema1808.github.io/excavadora-iot-control/

Se realizaron siete pruebas funcionales de la interfaz:

| No. | Prueba | Resultado |
|---|---|---|
| 1 | Carga de página y encabezado | Correcto |
| 2 | Apertura y cierre del menú | Correcto |
| 3 | Funcionamiento táctil del joystick | Correcto |
| 4 | Controles de brazo y pala | Correcto |
| 5 | Botón DETENER | Correcto |
| 6 | Adaptación horizontal | Correcto |
| 7 | Ausencia de desbordamiento horizontal | Correcto |

Resultado: 7 de 7 pruebas satisfactorias (100 %).

Nota: Las pruebas se realizaron en modo simulación.
No se verificó el movimiento físico de la excavadora.

