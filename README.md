# Manu HQ

Mi hub personal: rutina y comida de Plan-73, judo, cambio físico, calendario, hábitos, surf, estudio, idiomas, proyectos, contenido e ideas. Con mi música de Spotify en un botón arriba.

🔗 https://manu-alz.github.io/Manu-HQ/

## Secciones
- **Inicio**: lo que toca hoy, la semana, el plato y el batido del día (con sus macros, de Plan-73), tareas, ideas, proyectos y estudio.
- **Rutina / Gym**: se lee en vivo de [Plan-73](https://manu-alz.github.io/Plan-73/) (semana, bloques, ejercicios, días atléticos, sesión larga). Si cambio Plan-73, el HQ se actualiza solo. Si Plan-73 cambia de formato y alguna parte no se puede leer, aparece un aviso ⚠ arriba que dice cuál.
- **Calendario de entreno** (dentro de Rutina, y como popup desde la tarjeta "Semana" del Inicio): la semana en fila, de lunes a domingo, con un círculo por día para marcarlo como hecho. Se puede volver a semanas anteriores para marcar lo que te olvidaste (hacia adelante no).
- **Judo**: frase del día (218 frases y datos), los 4 pilares y las 100 técnicas del Kodokan con filtros por cinturón, grupo y estado.
- **Cambio físico**: mis pesajes + metas, números diarios, control de peso y objetivos de fuerza leídos de Plan-73.
- **Compras**: lista de cosas para comprar, con nota o link y precio opcionales.
- **Calendario** (en Vida): el mes completo con entrenos, tareas con fecha, entregas de estudio y pesajes. Tocás un día para ver o agregar cosas.
- **Watch list**: películas, series y videos para ver, con tipo y nota o link.
- **Comida** (debajo de Gym): la cocina de hoy según Plan-73. Tocás cualquier comida y se abre la receta (qué lleva, con cantidades). Abajo están todas las opciones: batidos, desayunos, almuerzos y cenas, meriendas.
- **Hábitos**: check-in de cada día con los números diarios de Plan-73 (calorías, proteína, creatina, agua, sueño…) más si entrené. Grilla de la semana y rachas.
- **Diario** (en Vida): un lugar para escribir lo que pienso, sin estructura. Entradas por día, buscador, se pueden editar, y lo que escribo y no guardo queda como borrador.
- **Lectura** (en Vida): mis libros en tres estantes (leyendo, quiero leer, leídos). Busco el libro por título y se completan solos el autor, las páginas y la portada (Open Library); lo agrego con un toque. Cada libro tiene página actual con barra de progreso, puntaje de 1 a 5 estrellas y notas o citas. Hay meta de libros del año y racha de lectura.
- **Pinterest** (en Trabajo): pego links de pins, de tableros o de mi perfil y los veo todos juntos, con etiquetas para filtrar. Se muestran con los widgets oficiales de Pinterest, porque Pinterest no deja leer las imágenes por link; el script de Pinterest se carga solo en esa sección.
- **Media** (en Trabajo): un tablero de mis fotos. Las pego con Ctrl + V, las arrastro o las elijo; se reducen a 1280 px y se guardan en el navegador (IndexedDB). Para sincronizarlas se suben a un segundo gist secreto ("Manu HQ · fotos"), aparte del de los datos, y los otros dispositivos las bajan de ahí. En la lista de datos solo queda la ficha de cada foto. Ojo: "Exportar datos" no incluye las imágenes.
- **Surf**, **Estudio**, **Idiomas**, **Proyectos**, **Contenido**, **Ideas**.
- Cada sección tiene sus propias notas. La barra de arriba guarda ideas desde cualquier página.
- **Música**: botón arriba, junto al buscador de ideas. Abre un menú flotante con el reproductor de Spotify y mi biblioteca: pego links de playlists, álbumes, artistas o canciones, los ordeno en carpetas y los busco. Al cerrar el menú sigue sonando, con play/pausa y progreso en la barra. Spotify no deja leer mis carpetas desde una página, por eso la biblioteca es propia (se sincroniza como el resto).
- **SoundCloud**: segundo botón arriba, al lado del de Spotify. El reproductor de SoundCloud no trae buscador: busco en SoundCloud (hay un link), pego el link, lo escucho o lo guardo en mi lista. Este sí tiene control de volumen. Si uno arranca, el otro se pausa.

## Atajos y uso
- **Ctrl + K** (o **/**): buscador rápido. Va a cualquier sección, hace acciones (marcar el entreno, escribir en el diario…) y busca en lo que escribí (tareas, ideas, diario, libros…).
- **Celular**: barra inferior con Inicio, Gym, Comida, Calendario y Más (que abre todas las secciones).
- **Deshacer**: al borrar una tarea, nota, idea, etc. aparece un aviso con "Deshacer" unos segundos.
- **Datos y sincronización** (abajo del menú): conectar los dispositivos, exportar e importar una copia de seguridad.

## Archivos
- `index.html`: estructura, pantalla de entrada y Spotify
- `styles.css`: diseño
- `app.js`: secciones, datos y lectura de Plan-73
- `judo-data.js`: técnicas, cinturones, pilares y frases

## Datos
Todo se guarda en el navegador (localStorage) y sobrevive a recargas.

**Sincronizar dispositivos** (botón en el menú): guarda los datos en un gist secreto de mi GitHub y los mantiene iguales en cada dispositivo conectado. Se conecta una vez por dispositivo con un token de GitHub que solo tenga permiso **Gists: Read and write**. Si cambio cosas distintas en dos dispositivos, se juntan.

**Exportar / Importar datos** siguen estando para hacer un backup a mano.
