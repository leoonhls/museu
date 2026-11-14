// Responsável: M2 — veja a seção "M2" no Guia da Entrega 2

import { Router } from 'express';
import * as controller from './controller.js';

export const rotas = Router();

rotas.get('/destaques', controller.listarDestaques);
