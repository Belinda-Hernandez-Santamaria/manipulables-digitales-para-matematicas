# Cocina Pizzas

Manipulable digital para practicar suma y resta de fracciones con pedidos de pizza.

## Estructura

- `Cocina_Pizza.html`: estructura de las pantallas y elementos del juego.
- `css/styles.css`: estilos, animaciones y estados visuales.
- `js/fractions.js`: operaciones y representación de fracciones.
- `js/order-data.js`: inventario inicial, nombres, plantillas y generación de pedidos.
- `js/state.js`: estado de la partida y del tutorial.
- `js/dialogs.js`: ventanas modales.
- `js/tutorial.js`: navegación y pasos del tutorial.
- `js/pizza.js`: dibujo de pizzas, rebanadas, inventario y arrastrar/soltar.
- `js/game-flow.js`: inicio de partidas, rondas y pedidos.
- `js/gameplay.js`: validación de pedidos, puntuación y resultados.
- `js/timer.js`: cuenta regresiva y estado del temporizador.

Los scripts se cargan como JavaScript clásico en el orden indicado en `Cocina_Pizza.html`; así, las funciones siguen disponibles para los manejadores de eventos del HTML. Conserva ese orden al cambiar las etiquetas `<script>`.

## Ejecución

1. Descarga o clona el repositorio y abre la carpeta `Proyecto 1 Pizzeria`.
2. Abre `Cocina_Pizza.html` en un navegador actualizado.

No requiere instalación, compilación ni una carpeta de ejecutables. Se necesita conexión a internet para cargar Tailwind CSS desde CDN; la fuente Inter también se carga desde CDN.

Si prefieres iniciar el archivo desde VS Code, puedes abrir la carpeta del proyecto y usar una extensión de servidor local como Live Server; no es obligatorio.
