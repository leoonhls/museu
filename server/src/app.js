// Responsável: M1
import express from 'express';
import session from 'express-session';
import { PASTA_CLIENTE, SEGREDO_SESSAO } from './config.js';
import { rotas } from './rotas.js';
import { rotaNaoEncontrada, tratarErros } from './middlewares/erros.js';

export const app = express();

app.use(express.json({ limit: '350kb' }));
app.use(
  session({
    secret: SEGREDO_SESSAO,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', maxAge: 8 * 60 * 60 * 1000 },
  }),
);

app.use('/api', rotas);
app.use('/api', rotaNaoEncontrada);
app.use(express.static(PASTA_CLIENTE));
app.use(tratarErros);
