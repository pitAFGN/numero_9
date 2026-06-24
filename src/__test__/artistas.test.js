const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');

const artistasRoutes = require('../routes/artistas');

const app = express();
app.use(express.json());
app.use('/artistas', artistasRoutes);

const dbPath = path.join(__dirname, '../database/database.json');

describe('Pruebas de Artistas', () => {
    
    beforeAll(() => {
        const estructuraLimpia = {
            eventos: [],
            artistas: [],
            asistentes: [],
            patrocinadores: []
        };
        fs.writeFileSync(dbPath, JSON.stringify(estructuraLimpia, null, 2), 'utf-8');
    });

    it('Debería registrar un nuevo artista exitosamente (POST /artistas)', async () => {
        const res = await request(app)
            .post('/artistas')
            .send({
                identificacion: "ART-TEST",
                nombre: "Débora Arango",
                disciplina: "Pintura"
            });
        
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('mensaje', 'Artista guardadito');
    });

    it('Debería rechazar el registro si el artista ya existe (POST /artistas - Duplicado)', async () => {
        const res = await request(app)
            .post('/artistas')
            .send({
                identificacion: "ART-TEST",
                nombre: "Otro Nombre",
                disciplina: "Escultura"
            });
        
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('mensaje', 'Este artista ya se encuentra registrado');
    });

    it('Debería denegar el acceso si faltan campos requeridos (POST /artistas)', async () => {
        const res = await request(app)
            .post('/artistas')
            .send({
                identificacion: "ART-INCOMPLETO"
            });
        
        expect(res.statusCode).toBe(400);
    });
});