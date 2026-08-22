import { Router } from 'express';
import * as statsController from '../controllers/statsController';

const router = Router();

// Estatísticas gerais
router.get('/stats', statsController.buscarStats);

// Lista de plataformas
router.get('/plataformas', statsController.buscarPlataformas);

export default router;
