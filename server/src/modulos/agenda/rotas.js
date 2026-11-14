
import express from 'express';
import * as controller from './controller.js';

export const rotas = express.Router();

rotas.get('/exposicoes', controller.listarExposicoes);
rotas.get('/exposicoes/:id', controller.buscarExposicao);
rotas.get('/eventos', controller.listarEventos);
