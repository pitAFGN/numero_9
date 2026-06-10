const express = require('express');

// 1. Importamos los 4 archivos de rutas (Tus hojas de instrucciones)
const artistasRoutes = require('./routes/artistas');
const eventosRoutes = require('./routes/eventos');
const asistentesRoutes = require('./routes/asistentes');
const patrocinadoresRoutes = require('./routes/patrocinadores');

const app = express();
const PORT = 3000;

// 2. El "Traductor": Permite que Express entienda los JSON que envías desde Thunder Client
app.use(express.json());

// 3. El "Conector": Vinculamos las rutas al servidor central
app.use('/artistas', artistasRoutes);
app.use('/eventos', eventosRoutes);
app.use('/asistentes', asistentesRoutes);
app.use('/patrocinadores', patrocinadoresRoutes);

app.listen(PORT, () => {

    console.log(`🚀 SERVIDOR ENCENDIDO EN: http://localhost:${PORT}`);
});