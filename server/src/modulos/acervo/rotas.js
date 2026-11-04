// Responsável: M4 — veja a seção "M4" no Guia da Entrega 2
import express from 'express';
import * as controller from './controller.js';

export const rotas = express.Router();

rotas.get('/obras/:id', controller.buscarObra);
rotas.get('/artistas', controller.listarArtistas);
rotas.get('/artistas/:id', controller.buscarArtista);
rotas.get('/categorias', controller.listarCategorias);
