// Responsável: M6 — veja a seção "M6" no Guia da Entrega 2
import express from 'express';
import * as controller from './controller.js';

export const rotas = express.Router();

// TODO (M6): proteger as três rotas com exigirLogin (middlewares/autenticacao.js)
rotas.post('/reservas', controller.criar);
rotas.get('/reservas/minhas', controller.listarMinhas);
rotas.delete('/reservas/:id', controller.cancelar);
