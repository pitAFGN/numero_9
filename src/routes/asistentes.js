const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/database.json');
const readDB = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');

// Registrar asistente con control de capacidad (Prueba Funcional 1)
router.post('/registrar', (req, res) => {
    try {
        const db = readDB();
        const { identificacion, nombre, correo, codigoEvento } = req.body;

        const evento = db.eventos.find(e => e.codigo === codigoEvento);
        if (!evento) return res.status(404).json({ mensaje: "El evento no existe" });

        if (evento.entradasVendidas >= evento.capacidadMaxima) {
            return res.status(400).json({ error: "Capacidad completa", mensaje: "Límite alcanzado." });
        }

        const nuevoAsistente = { identificacion, nombre, correo, codigoEvento };
        
        evento.entradasVendidas += 1; 
        db.asistentes.push(nuevoAsistente);
        writeDB(db);

        res.status(201).json({ mensaje: "Asistente registrado", asistente: nuevoAsistente });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al registrar asistente" });
    }
});

// Consultar asistentes de un evento (Prueba Funcional 2)
router.get('/evento/:codigo', (req, res) => {
    try {
        const db = readDB();
        const { codigo } = req.params;

        const lista = db.asistentes.filter(a => a.codigoEvento === codigo);
        res.json({ codigoEvento: codigo, total: lista.length, asistentes: lista });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al consultar lista" });
    }
});

module.exports = router;