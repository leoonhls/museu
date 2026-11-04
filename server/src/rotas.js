// Responsável: M1
import express from 'express';
import { rotas as destaques } from './modulos/destaques/rotas.js';
import { rotas as galeria } from './modulos/galeria/rotas.js';
import { rotas as acervo } from './modulos/acervo/rotas.js';
import { rotas as agenda } from './modulos/agenda/rotas.js';
import { rotas as conta } from './modulos/conta/rotas.js';
import { rotas as reservas } from './modulos/reservas/rotas.js';
import { rotas as admin } from './modulos/admin/rotas.js';

export const rotas = express.Router();

rotas.use(destaques);
rotas.use(galeria);
rotas.use(acervo);
rotas.use(agenda);
rotas.use(conta);
rotas.use(reservas);
rotas.use(admin);
