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
        const { identificacion, nombre, disciplina, biografia, contacto } = req.body;

        if (!identificacion || !nombre || !disciplina) {
            return res.status(400).json({ mensaje: "Identificación, nombre y disciplina son requeridos" });
        }

        const artistaExiste = db.artistas.some(a => a.identificacion === identificacion);
        if (artistaExiste) {
            return res.status(400).json({ mensaje: "Este artista ya se encuentra registrado" });
        }

        const nuevoArtista = {
            identificacion,
            nombre,
            disciplina,
            biografia: biografia || "Sin biografía :0",
            contacto: contacto || "Sin datos :("
        };

        db.artistas.push(nuevoArtista);
        writeDB(db);

        res.status(201).json({ mensaje: "Artista guardadito", artista: nuevoArtista });
    } catch (error) {
        res.status(500).json({ mensaje: "Error" });
    }
});

router.post('/vincular', (req, res) => {
    try {
        const db = readDB();
        const { codigoEvento, identificacionArtista } = req.body;

        const evento = db.eventos.find(e => e.codigo === codigoEvento);
        const artista = db.artistas.find(a => a.identificacion === identificacionArtista);

        if (!evento) {
            return res.status(404).json({ mensaje: "El evento no existe viejo" });
        }
        if (!artista) {
            return res.status(404).json({ mensaje: "El artista especificado no esta guardado" });
        }

        if (evento.artistasVinculados.includes(identificacionArtista)) {
            return res.status(400).json({ mensaje: "Este artista ya se encuentra vinculado a un evento :D" });
        }

        evento.artistasVinculados.push(identificacionArtista);
        
        writeDB(db);

        res.status(200).json({ 
            mensaje: `Artista ${artista.nombre} vinculado con éxito al evento ${evento.nombre}`,
            evento 
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error interno al vincular" });
    }
});

module.exports = router;