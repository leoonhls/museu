// Responsável: M2 — veja a seção "M2" no Guia da Entrega 2
import express from 'express';
import * as controller from './controller.js';

export const rotas = express.Router();

rotas.get('/destaques', controller.buscarDestaques);
