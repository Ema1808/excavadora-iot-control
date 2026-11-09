# Etapa 4: autenticación local

Copiar `index.html`, `assets/css/styles.css` y la carpeta `js/` a la raíz del proyecto, reemplazando archivos homónimos. Mantener favicon.svg.

Iniciar `python -m http.server 5500` y abrir http://127.0.0.1:5500/index.html. Introducir X-API-Key solo en el campo de la aplicación; no compartirla ni guardarla.

Se comprueban GET /, GET comandos y GET demos. No se ejecutan POST. WSS desconectado y RDS sin verificar.

Si aparece error de CORS, configurar el origen http://127.0.0.1:5500 en el backend y permitir el encabezado x-api-key. No desactivar CORS ni publicar la clave. CORS no es autenticación.

Advertencia: la clave está en memoria, pero es visible en DevTools/Network y en el navegador. Usar exclusivamente clave de pruebas con privilegios mínimos. No publicar esta versión en GitHub Pages.
