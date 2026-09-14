# Lúmina · Guardianes del Valle

Una primera demo original de aventura 2D: explora una aldea y su bosque, conoce criaturas, combate sombras con espada y despierta un santuario.

**[Descargar el proyecto completo en ZIP](https://github.com/Electroingenieria-SAS/EI/archive/refs/heads/main.zip)**

## Jugar

1. Descarga y extrae el ZIP.
2. Abre **index.html** en Chrome, Edge o Firefox.
3. Pulsa **Comenzar aventura**. Habla con Mara, junto al sendero.
4. Opcional: activa el sonido desde la barra superior.

Phaser 3.90.0 está incluido en **vendor/phaser.min.js**. El arte se genera localmente desde su código fuente. La versión incluida puede funcionar sin conexión, sin instalar paquetes. El guardado en archivos locales depende de las políticas de cada navegador; para una experiencia consistente, usa el servidor local o GitHub Pages.

### Servidor local recomendado

Con Node.js 20 o posterior:

~~~sh
npm start
~~~

Abre http://localhost:8080. No hace falta ejecutar npm install para jugar ni para las pruebas de reglas.

## Qué contiene esta entrega

- Mundo exterior de **48 × 36 tiles**, con aldea, bosque, río, puente y ruinas.
- Santuario interior de **22 × 18 tiles**, con guardián y altar.
- **131 texturas originales**: terreno, casas, árboles, mobiliario, personajes y criaturas.
- Protagonista y tres apariencias de NPC con cuatro direcciones y cuatro cuadros por dirección.
- Cuatro NPC: Mara, Lío, Inés y Taro; diálogos, patrullas y curación.
- Brote, Ascua y Nimbo: tres criaturas, afinidades elementales, compañero visible y selección desde el diario.
- Encuentros por turnos con ataque, técnica elemental, defensa, tónico, captura y retirada.
- Espada para cortar arbustos y combatir tres sombras en el mundo.
- Carrera, esquiva, energía, daño, recuperación y colisiones con edificios, árboles y agua.
- Misión con inicio, captura, secuencia de tres runas y combate final.
- Tres cofres, inventario, experiencia acumulada y guardado local.
- Agua y fuego animados, partículas ambientales, música sintetizada y efectos originales.
- Interfaz en español, minimapa, mapa ampliado, diario, pausa y controles táctiles.
- Exportación del atlas PNG desde **Esc → Ver y exportar arte**.

Es una **base de desarrollo v0.1**, no un juego comercial terminado. Las casas no tienen interiores; la única estancia interior es el santuario. La experiencia se acumula, pero todavía no aumenta niveles ni estadísticas. Las criaturas silvestres tienen animación de reposo; los NPC sí recorren pequeñas rutas. El mapa se edita en JavaScript; no hay importador Tiled en esta versión.

## Controles

| Acción | Tecla |
|---|---|
| Caminar | WASD o flechas |
| Correr | Shift |
| Hablar / cofre / criatura / runa | E |
| Espada | J |
| Rodar | Espacio |
| Mapa | M |
| Diario y compañero | I |
| Pausa | Esc |
| Ayuda | H |
| Encuentro | Botones o teclas 1–6 |

## Recorrido para auditar la demo

1. Habla con **Mara** y termina el diálogo.
2. Explora el bosque: **Ascua** está en el claro del norte. **Nimbo**, en la ribera oriental.
3. Pulsa **E** junto a una criatura. Debilítala y utiliza una campana. Con vitalidad del 30 % o menos, la captura es segura. Por encima, es probabilística.
4. Descansa con **Inés**, cerca de la posada. Recupera tu equipo y repone al menos tres campanas y dos tónicos.
5. Cruza el puente hacia el este. Sigue el sendero hacia las ruinas del noreste.
6. Activa las runas en orden **Hoja → Agua → Fuego**. Una equivocación reinicia la secuencia.
7. Entra al santuario. Usar **Ascua** ofrece una afinidad favorable contra el guardián.
8. Supera el encuentro, examina el altar y regresa al valle.
9. Recarga la página y utiliza **Continuar travesía** para revisar el guardado.

La captura exige una especie nueva para avanzar; Brote ya es tu compañero inicial. Los encuentros no se activan automáticamente al caminar. La espada no captura criaturas.

## Publicar en GitHub Pages

En este repositorio:

1. **Settings → Pages**.
2. **Source → Deploy from a branch**.
3. Selecciona **main** y **/(root)**.
4. Guarda y espera a que GitHub muestre la dirección de la publicación.

La dirección esperada, una vez activado Pages, es https://electroingenieria-sas.github.io/EI/. No requiere compilación. El archivo .nojekyll evita el procesamiento Jekyll.

Guía oficial: https://docs.github.com/en/pages/quickstart

## Organización y edición

| Archivo | Responsabilidad |
|---|---|
| index.html / styles.css | Interfaz, adaptación de pantalla y carga |
| src/core.js | Reglas puras, daño, captura, guardado y movimiento |
| src/world.js | Terrenos, posiciones, colisiones y distribución |
| src/game.js | Escena Phaser, cámara, controles, NPC y espada |
| src/ui.js | Diálogos, diario, encuentros y persistencia |
| src/audio.js | Síntesis musical y efectos |
| assets/atlas.js | Arte original y cuadros de animación |
| assets/emblem.svg | Emblema del juego |
| vendor/ | Motor Phaser y licencia de su autor |
| tests/ | Pruebas de reglas y de navegador |

Las coordenadas de objetos y personajes se expresan en píxeles. Un tile mide 32 × 32. Los sprites usan ancla inferior central. Para mover casas, NPC o criaturas modifica **VALLEY** en **src/world.js**. Los árboles decorativos se generan con una semilla fija para que el mapa sea reproducible; evitan caminos y puntos importantes.

Consulta [docs/EDICION.md](docs/EDICION.md) para editar y [docs/VALIDACION.md](docs/VALIDACION.md) para el alcance de las pruebas.

## Pruebas

Reglas, movimiento, guardado y accesibilidad de puntos del mapa:

~~~sh
npm test
~~~

Pruebas de navegador:

~~~sh
npm install
npx playwright install chromium
npm run test:browser
~~~

Las pruebas de navegador recorren los menús y la misión usando interacciones reales; teleportan al personaje entre puntos para reducir el tiempo de viaje. Las pruebas de mapa comprueban por separado que esos puntos sean accesibles caminando.

Para volver a descargar el motor exacto y su licencia desde sus fuentes:

~~~sh
npm run vendor
~~~

## Créditos y licencia

Código, nombres, diálogos, diseño del mapa, arte programado y síntesis musical: creación original para esta demo. Licencia MIT; consulta [LICENSE](LICENSE).

Motor: **Phaser 3.90.0**, de Richard Davey / Phaser Studio Inc., MIT. Copia de su licencia en [vendor/PHASER-LICENSE.txt](vendor/PHASER-LICENSE.txt). Fuente: https://github.com/phaserjs/phaser/tree/v3.90.0

No se incluyen mapas, personajes, música ni gráficos extraídos de Pokémon o The Legend of Zelda. Kenney se consideró como referencia de recursos, pero sus paquetes no forman parte de esta entrega.
