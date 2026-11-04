// Responsável: M8 — veja a seção "M8" no Guia da Entrega 2
import express from 'express';
import * as controller from './controller.js';
import { uploadImagem } from '../../middlewares/upload.js';

export const rotas = express.Router();

// TODO (M8): proteger as quatro rotas com exigirAdmin (middlewares/autenticacao.js)
rotas.post('/obras', controller.criarObra);
rotas.put('/obras/:id', controller.editarObra);
rotas.delete('/obras/:id', controller.excluirObra);
rotas.post('/uploads', uploadImagem, controller.receberUpload);
