// Responsável: M6 — veja a seção "M6" no Guia da Entrega 2

import express from 'express';
import * as controller from './controller.js';
import { exigirLogin } from '../../middlewares/autenticacao.js';

export const rotas = express.Router();

rotas.post('/reservas', exigirLogin, controller.criar);
rotas.get('/reservas/minhas', exigirLogin, controller.listarMinhas);
rotas.delete('/reservas/:id', exigirLogin, controller.cancelar);
