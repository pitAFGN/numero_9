const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/database.json');
const readDB = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');

// Programar nuevo evento
router.post('/', (req, res) => {
    try {
        const db = readDB();
        const { nombre, tipo, fecha, ubicacion, capacidadMaxima } = req.body;

        if (!nombre || !tipo || !fecha || !ubicacion || !capacidadMaxima) {
            return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
        }

        const nuevoEvento = {
            codigo: `EV-${db.eventos.length + 1}`,
            nombre,
            tipo, 
            fecha,
            ubicacion,
            capacidadMaxima: parseInt(capacidadMaxima),
            entradasVendidas: 0,
            estado: "programado", 
            artistasVinculados: []
        };

        db.eventos.push(nuevoEvento);
        writeDB(db);

        res.status(201).json({ mensaje: "Evento programado con éxito", evento: nuevoEvento });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al programar evento" });
    }
});

// Consultar eventos con filtros
router.get('/', (req, res) => {
    try {
        const db = readDB();
        let resultado = db.eventos;
        const { tipo, estado } = req.query;

        if (tipo) resultado = resultado.filter(e => e.tipo === tipo);
        if (estado) resultado = resultado.filter(e => e.estado === estado);

        res.json(resultado);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al consultar eventos" });
    }
});

// Actualizar información del evento
router.put('/:codigo', (req, res) => {
    try {
        const db = readDB();
        const { codigo } = req.params;
        const { fecha, ubicacion, capacidadMaxima } = req.body;

        const eventoIdx = db.eventos.findIndex(e => e.codigo === codigo);
        if (eventoIdx === -1) return res.status(404).json({ mensaje: "Evento no encontrado" });

        if (fecha) db.eventos[eventoIdx].fecha = fecha;
        if (ubicacion) db.eventos[eventoIdx].ubicacion = ubicacion;
        if (capacidadMaxima) db.eventos[eventoIdx].capacidadMaxima = parseInt(capacidadMaxima);

        writeDB(db);
        res.json({ mensaje: "Evento actualizado", evento: db.eventos[eventoIdx] });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar" });
    }
});

// Cancelar evento (Delete Lógico)
router.patch('/:codigo/cancelar', (req, res) => {
    try {
        const db = readDB();
        const { codigo } = req.params;

        const evento = db.eventos.find(e => e.codigo === codigo);
        if (!evento) return res.status(404).json({ mensaje: "Evento no encontrado" });

        evento.estado = "cancelado"; 
        writeDB(db);

        res.json({ mensaje: "Evento cancelado con éxito", evento });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al cancelar" });
    }
});

module.exports = router;