import { Request, Response } from 'express';
import * as vagaService from '../services/vagaService';
import { recalcularTodosScores } from '../services/scoreService';

/**
 * GET /api/vagas — Listar vagas com filtros
 */
export async function listarVagas(req: Request, res: Response) {
  try {
    const filtros = {
      dias: req.query.dias ? parseInt(req.query.dias as string) : undefined,
      plataforma: req.query.plataforma as string,
      tipo: req.query.tipo as string,
      busca: req.query.busca as string,
      status: req.query.status as string,
      ignoradas: req.query.ignoradas === 'true',
      apenas_pra_mim: req.query.apenas_pra_mim === 'true',
      page: parseInt(req.query.page as string) || 1,
      per_page: parseInt(req.query.per_page as string) || 20,
    };

    const result = await vagaService.buscarVagas(filtros);
    res.json(result);
  } catch (err) {
    console.error('Erro ao listar vagas:', err);
    res.status(500).json({ error: 'Erro interno ao listar vagas' });
  }
}

/**
 * PUT /api/vagas/:id/status — Atualizar status da vaga
 */
export async function atualizarStatus(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const vaga = await vagaService.atualizarVaga(id, req.body);

    if (!vaga) {
      return res.status(404).json({ error: 'Vaga não encontrada' });
    }

    res.json(vaga);
  } catch (err) {
    console.error('Erro ao atualizar vaga:', err);
    res.status(500).json({ error: 'Erro interno ao atualizar vaga' });
  }
}

/**
 * POST /api/vagas/:id/ignorar — Ignorar vaga
 */
export async function ignorarVaga(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    await vagaService.ignorarVaga(id);
    res.json({ message: 'Vaga ignorada com sucesso' });
  } catch (err) {
    console.error('Erro ao ignorar vaga:', err);
    res.status(500).json({ error: 'Erro interno ao ignorar vaga' });
  }
}

/**
 * POST /api/vagas/:id/restaurar — Restaurar vaga ignorada
 */
export async function restaurarVaga(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    await vagaService.restaurarVaga(id);
    res.json({ message: 'Vaga restaurada com sucesso' });
  } catch (err) {
    console.error('Erro ao restaurar vaga:', err);
    res.status(500).json({ error: 'Erro interno ao restaurar vaga' });
  }
}

/**
 * POST /api/vagas/:id/favoritar — Toggle "Pra Mim"
 */
export async function toggleFavoritar(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const vaga = await vagaService.toggleFavoritar(id);

    if (!vaga) {
      return res.status(404).json({ error: 'Vaga não encontrada' });
    }

    res.json(vaga);
  } catch (err) {
    console.error('Erro ao favoritar vaga:', err);
    res.status(500).json({ error: 'Erro interno ao favoritar vaga' });
  }
}

/**
 * POST /api/calcular-scores — Recalcular todos os scores
 */
export async function calcularScores(_req: Request, res: Response) {
  try {
    const atualizadas = await recalcularTodosScores();
    res.json({
      message: 'Scores recalculados com sucesso',
      vagas_atualizadas: atualizadas,
    });
  } catch (err) {
    console.error('Erro ao calcular scores:', err);
    res.status(500).json({ error: 'Erro interno ao calcular scores' });
  }
}
