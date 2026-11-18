const express = require('express');
const app = express();
require('dotenv').config({ path: '../.env' });

app.use(express.json());

// Rutas
app.use('/api/centros', require('./routes/centro'));
app.use('/api/escuelas', require('./routes/escuela'));
app.use('/api/departamentos', require('./routes/departamento'));
app.use('/api/municipios', require('./routes/municipio'));
app.use('/api/generos', require('./routes/genero'));
app.use('/api/roles', require('./routes/rol'));
app.use('/api/usuarios', require('./routes/usuario'));
app.use('/api/licencias', require('./routes/licencia'));
app.use('/api/tramites', require('./routes/tramite'));
app.use('/api/personas', require('./routes/persona'));
app.use('/api/instructores', require('./routes/instructor'));
app.use('/api/cenescuelas', require('./routes/cenescuela'));
app.use('/api/fases', require('./routes/fase'));
app.use('/api/preguntas', require('./routes/pregunta'));
app.use('/api/respuestas', require('./routes/respuesta'));
app.use('/api/registros-evaluacion', require('./routes/regisEvalua'));
app.use('/api/registros-respuesta', require('./routes/regisRespu'));

// Consultas estadísticas
app.use('/api/estadisticas', require('./routes/estadisticas'));

const PORT = process.env.API_PORT || 3000;
app.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
});