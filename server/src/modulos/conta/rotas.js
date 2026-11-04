// Responsável: M7 — veja a seção "M7" no Guia da Entrega 2
import express from 'express';
import * as controller from './controller.js';

export const rotas = express.Router();

rotas.get('/auth/me', controller.usuarioAtual);
rotas.post('/auth/cadastro', controller.cadastrar);
rotas.post('/auth/login', controller.entrar);
rotas.post('/auth/logout', controller.sair);

// TODO (M7): proteger as rotas de favoritos com exigirLogin (middlewares/autenticacao.js)
rotas.get('/favoritos', controller.listarFavoritos);
rotas.post('/favoritos/:obraId', controller.favoritar);
rotas.delete('/favoritos/:obraId', controller.desfavoritar);
