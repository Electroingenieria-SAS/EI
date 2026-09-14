# Cómo reorganizar el mundo

## Cambiar posiciones

En src/world.js, VALLEY contiene houses, npcs, objects, wild, enemies y bushes.
Por ejemplo, para mover a Mara:

~~~js
{ id: 'mara', x: 432, y: 852, route: [[432, 852], [472, 852]], ... }
~~~

Modifica tanto x/y como los puntos de route. Los diálogos se seleccionan por id en talk(), dentro de src/game.js. Conserva los identificadores de misión o actualiza sus referencias.

Las casas tienen colisión en la parte inferior; sus techos y los árboles se ordenan por la coordenada y. Esta profundidad permite caminar detrás de las copas y delante de las fachadas.

## Tiles

- grass: césped.
- path: sendero.
- water: agua no transitable.
- bridge: puente transitable.
- stone: explanada de las ruinas.
- floor: suelo interior.
- wall: muro no transitable.

valley() y sanctum() devuelven una matriz de tiles, objetos y rectángulos de colisión.
rect() permite pintar zonas. El tamaño de tile es 32 píxeles.

No coloques objetos interactivos completamente encerrados. Ejecuta npm test después de cambiar caminos o posiciones: las pruebas buscan rutas transitables hasta cada punto de misión.

## Sprites y animación

assets/atlas.js crea 131 texturas Canvas a resolución nativa. Las instala en Phaser al arrancar.
Ejemplos de claves:
- hero-down-0 hasta hero-down-3.
- sage-left-0 hasta sage-left-3.
- brote-0 hasta brote-3.
- house-0, house-1, house-2.
- rune-hoja-0 y rune-hoja-1.

Para reemplazar arte por PNG dibujados manualmente, carga las imágenes con las mismas claves y evita que Art.install() las duplique. Los sprites de personajes usan 24 × 34 píxeles. Los sprites de criaturas normales usan 40 × 44; el guardián usa 56 × 60. Los cuadros de esta versión tienen cambios de patas, balanceo y orientación, no esqueletos.

En el juego, Esc → Ver y exportar arte descarga una lámina PNG de las texturas.

## Añadir contenido

- NPC nuevo: añade los datos, una ruta y una rama de diálogo en talk().
- Criatura nueva: añade SPECIES, arte y reglas de selección/captura. Actualiza la lista permitida de sanitize() y el diario.
- Zona nueva: crea una función de mapa, un portal y la validación del nombre en sanitize().
- Misiones: las banderas actuales están en initialState(). Si cambias el formato del guardado, aumenta version y define una migración.
- Sonido: audio.js usa Web Audio; cada efecto es una secuencia corta de frecuencias.

## Auditoría sugerida

Comprueba suavidad al caminar, prioridad visual frente a árboles, lectura de edificios y escala.
Anota posiciones concretas: “mover a Mara de (432,852) a (...)”, “hacer el puente dos tiles más ancho”.
Esta base deja distribución, reglas, interfaz y arte en archivos distintos para facilitar esas correcciones.
