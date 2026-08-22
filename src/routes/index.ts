import { Router } from 'express';
import vagasRouter from './vagas';
import statsRouter from './stats';
import buscarRouter from './buscar';

const router = Router();

// Info da API
router.get('/', (_req, res) => {
  res.json({
    name: 'Job Classifier API',
    version: '1.0.0',
    description: 'API REST para gestão de vagas de emprego',
    author: 'Marcos Santos da Silva',
    endpoints: {
      vagas: '/api/vagas',
      stats: '/api/stats',
      plataformas: '/api/plataformas',
      status: '/api/status',
      importar: '/api/importar',
    },
  });
});

// Rotas
router.use('/vagas', vagasRouter);
router.use(statsRouter);
router.use(buscarRouter);

export default router;
