import { Router } from 'express';
import * as vagasController from '../controllers/vagasController';

const router = Router();

// Listar vagas com filtros
router.get('/', vagasController.listarVagas);

// Atualizar status da vaga
router.put('/:id/status', vagasController.atualizarStatus);

// Ignorar vaga
router.post('/:id/ignorar', vagasController.ignorarVaga);

// Restaurar vaga ignorada
router.post('/:id/restaurar', vagasController.restaurarVaga);

// Toggle "Pra Mim"
router.post('/:id/favoritar', vagasController.toggleFavoritar);

// Recalcular scores
router.post('/calcular-scores', vagasController.calcularScores);

export default router;
