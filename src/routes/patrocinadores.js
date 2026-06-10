const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/database.json');
const readDB = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');

router.post('/', (req, res) => {
    try {
        const db = readDB();
        const { identificacion, nombreEmpresa, montoAportado } = req.body;

        if (!identificacion || !nombreEmpresa) {
            return res.status(400).json({ mensaje: "Identificación y empresa son requeridos" });
        }

        const nuevoPatrocinador = { identificacion, nombreEmpresa, montoAportado: parseFloat(montoAportado) || 0 };
        db.patrocinadores.push(nuevoPatrocinador);
        writeDB(db);

        res.status(201).json({ mensaje: "Patrocinador guardado", patrocinador: nuevoPatrocinador });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al registrar patrocinador" });
    }
});

router.get('/', (req, res) => {
    try {
        const db = readDB();
        res.json(db.patrocinadores);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al consultar" });
    }
});

module.exports = router;