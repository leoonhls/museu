// Responsável: M8 — veja a seção "M8" no Guia da Entrega 2
import express from 'express';
import * as controller from './controller.js';
import { uploadImagem } from '../../middlewares/upload.js';
import { exigirAdmin } from '../../middlewares/autenticacao.js';
export const rotas = express.Router();


rotas.post('/obras', exigirAdmin, controller.criarObra);
rotas.put('/obras/:id', exigirAdmin, controller.editarObra);
rotas.delete('/obras/:id', exigirAdmin, controller.excluirObra);
rotas.post('/uploads', exigirAdmin, uploadImagem, controller.receberUpload);
