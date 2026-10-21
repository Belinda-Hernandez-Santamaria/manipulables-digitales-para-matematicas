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

Abre `Cocina_Pizza.html` en un navegador. No requiere instalación ni compilación. Tailwind CSS y la fuente Inter se cargan desde CDN, por lo que esos recursos requieren conexión a internet.
