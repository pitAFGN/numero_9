const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');

const eventosRoutes = require('../routes/eventos');

const app = express();
app.use(express.json());
app.use('/eventos', eventosRoutes);

const dbPath = path.join(__dirname, '../database/database.json');

describe('🧪 Pruebas Automatizadas - Módulo de Eventos', () => {

    // Antes de cada test, dejamos la base de datos limpia para que no se pisen las pruebas
    beforeEach(() => {
        const estructuraLimpia = {
            eventos: [],
            artistas: [],
            asistentes: [],
            patrocinadores: []
        };
        fs.writeFileSync(dbPath, JSON.stringify(estructuraLimpia, null, 2), 'utf-8');
    });

    // 1. TEST POST (Creación)
    it('Debería programar un nuevo evento exitosamente (POST /eventos)', async () => {
        const res = await request(app)
            .post('/eventos')
            .send({
                nombre: "Festival de Poesía",
                tipo: "talleres",
                fecha: "2026-07-20T16:00:00Z",
                ubicacion: "Teatro al Aire Libre Carlos Vieco",
                capacidadMaxima: 100
            });
        
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('mensaje', 'Evento programado con éxito');
        expect(res.body.evento).toHaveProperty('codigo', 'EV-1');
    });

    // 2. TEST GET (Filtros por Query)
    it('Debería filtrar los eventos por tipo (GET /eventos?tipo=...)', async () => {
        // Simulamos que ya existen dos eventos con tipos diferentes en el JSON
        const dbMock = {
            eventos: [
                { codigo: "EV-1", nombre: "Concierto Rock", tipo: "concierto", estado: "programado" },
                { codigo: "EV-2", nombre: "Taller Óleo", tipo: "talleres", estado: "programado" }
            ],
            artistas: [], asistentes: [], patrocinadores: []
        };
        fs.writeFileSync(dbPath, JSON.stringify(dbMock, null, 2), 'utf-8');

        // Hacemos la petición GET filtrando solo por 'concierto'
        const res = await request(app).get('/eventos?tipo=concierto');
        
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1); // Solo debe retornar un evento
        expect(res.body[0].tipo).toBe('concierto');
    });

    // 3. TEST PUT (Actualización por Params)
    it('Debería actualizar la ubicación y fecha de un evento (PUT /eventos/:codigo)', async () => {
        // Dejamos un evento base guardado
        const dbMock = {
            eventos: [{ codigo: "EV-1", nombre: "Obra de Teatro", tipo: "teatro", ubicacion: "Lugar Viejo", fecha: "2026-01-01" }],
            artistas: [], asistentes: [], patrocinadores: []
        };
        fs.writeFileSync(dbPath, JSON.stringify(dbMock, null, 2), 'utf-8');

        const res = await request(app)
            .put('/eventos/EV-1')
            .send({
                ubicacion: "Teatro Prado El Águila Descalza",
                fecha: "2026-08-22T20:00:00Z"
            });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.evento.ubicacion).toBe("Teatro Prado El Águila Descalza");
    });

    // 4. TEST PATCH (Borrado Lógico)
    it('Debería cambiar el estado del evento a cancelado (PATCH /eventos/:codigo/cancelar)', async () => {
        const dbMock = {
            eventos: [{ codigo: "EV-1", nombre: "Cine al Parque", tipo: "tertulias", estado: "programado" }],
            artistas: [], asistentes: [], patrocinadores: []
        };
        fs.writeFileSync(dbPath, JSON.stringify(dbMock, null, 2), 'utf-8');

        const res = await request(app).patch('/eventos/EV-1/cancelar');
        
        expect(res.statusCode).toBe(200);
        expect(res.body.evento.estado).toBe("cancelado"); // Verifica que se aplicó el borrado lógico
    });
});