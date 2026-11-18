const express = require('express');
const app = express();
require('dotenv').config({ path: '../.env' });

const { cargarDatos } = require('./datos');

app.use(express.json());

// Rutas
app.use('/api/departamentos',           require('./routes/departamento'));
app.use('/api/municipios',              require('./routes/municipio'));
app.use('/api/centros',                 require('./routes/centro'));
app.use('/api/escuelas',                require('./routes/escuela'));
app.use('/api/ubicaciones',             require('./routes/ubicacion'));
app.use('/api/preguntas',               require('./routes/preguntas'));
app.use('/api/preguntas-practico',      require('./routes/preguntas_practico'));
app.use('/api/correlativos',            require('./routes/correlativo'));
app.use('/api/registros',               require('./routes/registro'));
app.use('/api/examenes',                require('./routes/examen'));
app.use('/api/respuestas-usuario',      require('./routes/respuesta_usuario'));
app.use('/api/respuestas-practico',     require('./routes/respuesta_practico_usuario'));
app.use('/api/estadisticas',            require('./routes/estadisticas'));

// Consultas estadísticas
app.use('/api/estadisticas', require('./routes/estadisticas'));

const PORT = process.env.API_PORT || 3000;

async function start() {
  try {
    await cargarDatos();
  } catch (err) {
    console.error('Carga de datos falló:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
  });
}

start();