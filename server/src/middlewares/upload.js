

import multer from 'multer';
import { PASTA_UPLOADS } from '../config.js';
import { requisicaoInvalida } from '../erros.js';

const armazenamento = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PASTA_UPLOADS);
  },
  
filename: (req, file, cb) => {
  const nomeUnico = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const extensao = file.originalname.split('.').pop().toLowerCase();
  cb(null, `${nomeUnico}.${extensao}`);
}

});

const filtroImagem = (req, file, cb) => {
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];

  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    
    cb(requisicaoInvalida('Formato de imagem não permitido.'));

  }
};

const upload = multer({
  storage: armazenamento,
  fileFilter: filtroImagem,
  limits: {
    fileSize: 2 * 1024 * 1024
  }
});



export const uploadImagem = upload.single('imagem');

