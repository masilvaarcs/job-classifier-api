import { Router } from 'express';
import * as importController from '../controllers/importController';

const router = Router();

// Status de buscas
router.get('/status', importController.statusBusca);

// Buscar todas as plataformas
router.post('/buscar/todas', importController.buscarTodas);

// Buscar plataforma específica
router.post('/buscar/:plataforma', importController.buscarPlataforma);

// Importar dados do microserviço
router.post('/importar', importController.importarDados);

export default router;
