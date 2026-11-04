// Responsável: M3 — veja a seção "M3" no Guia da Entrega 2
import express from 'express';
import * as controller from './controller.js';

export const rotas = express.Router();

rotas.get('/obras', controller.listarObras);
