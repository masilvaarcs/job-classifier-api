import { Request, Response } from 'express';
import { importarVagas } from '../services/importService';
import type { VagaCreate } from '../models/vaga';

// Status global de buscas em andamento
const buscaStatus = {
  em_andamento: false,
  plataformas_em_execucao: [] as string[],
  ultima_execucao: '',
};

/**
 * GET /api/status — Status de buscas
 */
export function statusBusca(_req: Request, res: Response) {
  res.json(buscaStatus);
}

/**
 * POST /api/importar — Importar dados do microserviço Python
 */
export async function importarDados(req: Request, res: Response) {
  try {
    const { vagas } = req.body;

    if (!Array.isArray(vagas)) {
      return res.status(400).json({ error: 'Dados inválidos. Envie { vagas: [...] }' });
    }

    const result = await importarVagas(vagas as VagaCreate[]);
    res.json({
      message: 'Importação concluída',
      ...result,
    });
  } catch (err) {
    console.error('Erro ao importar dados:', err);
    res.status(500).json({ error: 'Erro interno ao importar dados' });
  }
}

/**
 * POST /api/buscar/todas — Disparar busca em todas as plataformas
 */
export async function buscarTodas(_req: Request, res: Response) {
  try {
    buscaStatus.em_andamento = true;
    buscaStatus.plataformas_em_execucao = [
      'LinkedIn', 'Indeed', 'Jooble', 'Freelancer', 'Glassdoor', 'BNE'
    ];
    buscaStatus.ultima_execucao = new Date().toISOString();

    // Em produção, aqui seria chamado o microserviço Python
    // await axios.post('http://localhost:8001/scraping/todas');

    res.json({
      message: 'Busca iniciada para todas as plataformas',
      status: buscaStatus,
    });

    // Simular conclusão após 5s
    setTimeout(() => {
      buscaStatus.em_andamento = false;
      buscaStatus.plataformas_em_execucao = [];
    }, 5000);
  } catch (err) {
    console.error('Erro ao iniciar busca:', err);
    res.status(500).json({ error: 'Erro interno ao iniciar busca' });
  }
}

/**
 * POST /api/buscar/:plataforma — Buscar plataforma específica
 */
export async function buscarPlataforma(req: Request, res: Response) {
  try {
    const { plataforma } = req.params;

    buscaStatus.em_andamento = true;
    buscaStatus.plataformas_em_execucao = [plataforma];
    buscaStatus.ultima_execucao = new Date().toISOString();

    // Em produção, aqui seria chamado o microserviço Python
    // await axios.post(`http://localhost:8001/scraping/${plataforma}`);

    res.json({
      message: `Busca iniciada para ${plataforma}`,
      status: buscaStatus,
    });

    // Simular conclusão após 3s
    setTimeout(() => {
      buscaStatus.em_andamento = false;
      buscaStatus.plataformas_em_execucao = [];
    }, 3000);
  } catch (err) {
    console.error('Erro ao buscar plataforma:', err);
    res.status(500).json({ error: 'Erro interno ao buscar plataforma' });
  }
}
