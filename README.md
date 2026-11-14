# CONTROL PRO — PWA 0.1.0

Primera versión web progresiva de CONTROL PRO. Está diseñada para uso personal y almacenamiento local en el dispositivo.

## Funciones incluidas
- Panel diario con resumen de tareas.
- Perfiles de puesto: Cajero Principal, Subgerente, Gerente y perfiles personalizados.
- Responsabilidades configurables por perfil.
- Tareas con prioridad, fecha límite, área y repetición diaria.
- Proyectos y bitácora.
- Exportación e importación de respaldos JSON.
- Interfaz adaptable a móvil y tablet, en modo oscuro.

## Abrir para probar
Extrae el ZIP y abre `index.html` en Chrome. Las funciones principales utilizan almacenamiento local del navegador.

## Instalar como aplicación y usar sin conexión
Para que Chrome permita instalarla como PWA y activar el service worker, publica los archivos en un sitio HTTPS (por ejemplo, GitHub Pages o un hosting estático HTTPS). Después abre la dirección en Chrome Android y usa el menú **Instalar aplicación** o **Añadir a pantalla de inicio**.

## Privacidad y respaldo
Los datos se guardan en el almacenamiento local del navegador (localStorage). No se envían a ningún servidor. Exporta respaldos regularmente y guárdalos en un lugar seguro. Borrar los datos del sitio o los datos de Chrome puede eliminar la información local.

## Nota
Esta es una primera versión funcional de organización personal; no se conecta a sistemas internos de ninguna empresa.
