// Responsável: M7 — veja a seção "M7" no Guia da Entrega 2
import express from 'express';
import * as controller from './controller.js';
import { exigirLogin } from '../../middlewares/autenticacao.js';

export const rotas = express.Router();

rotas.get('/auth/me', controller.usuarioAtual);
rotas.post('/auth/cadastro', controller.cadastrar);
rotas.post('/auth/login', controller.entrar);
rotas.post('/auth/logout', controller.sair);
rotas.get('/auth/perfil', exigirLogin, controller.obterPerfil);
rotas.put('/auth/perfil', exigirLogin, controller.atualizarPerfil);
rotas.get('/auth/historico', exigirLogin, controller.listarHistorico);

rotas.get('/favoritos', exigirLogin, controller.listarFavoritos);
rotas.post('/favoritos/:obraId', exigirLogin, controller.favoritar);
rotas.delete('/favoritos/:obraId', exigirLogin, controller.desfavoritar);
