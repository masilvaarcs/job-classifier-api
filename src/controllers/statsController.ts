import { Request, Response } from 'express';
import * as vagaService from '../services/vagaService';

/**
 * GET /api/stats — Estatísticas gerais
 */
export async function buscarStats(_req: Request, res: Response) {
  try {
    const stats = await vagaService.buscarStats();
    res.json(stats);
  } catch (err) {
    console.error('Erro ao buscar stats:', err);
    res.status(500).json({ error: 'Erro interno ao buscar estatísticas' });
  }
}

/**
 * GET /api/plataformas — Lista de plataformas
 */
export async function buscarPlataformas(_req: Request, res: Response) {
  try {
    const plataformas = await vagaService.buscarPlataformas();
    res.json(plataformas);
  } catch (err) {
    console.error('Erro ao buscar plataformas:', err);
    res.status(500).json({ error: 'Erro interno ao buscar plataformas' });
  }
}
