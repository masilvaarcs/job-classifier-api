import pool from '../config/database';
import type { Vaga, Filtros, PaginacaoResponse, Stats, Plataforma } from '../models/vaga';

/**
 * Busca vagas com filtros e paginação
 */
export async function buscarVagas(filtros: Filtros): Promise<PaginacaoResponse> {
  const conditions: string[] = ['1=1'];
  const params: (string | number | boolean)[] = [];
  let paramIndex = 1;

  // Filtro por dias
  if (filtros.dias !== undefined && filtros.dias !== null && filtros.dias > 0) {
    conditions.push(`data_coleta >= NOW() - INTERVAL '${filtros.dias} days'`);
  }

  // Filtro por plataforma
  if (filtros.plataforma && filtros.plataforma !== 'Todas') {
    conditions.push(`plataforma = $${paramIndex}`);
    params.push(filtros.plataforma);
    paramIndex++;
  }

  // Filtro por tipo
  if (filtros.tipo && filtros.tipo !== 'Todos') {
    const tipoMap: Record<string, string> = {
      '🟢 Remoto': 'REMOTO',
      '🟡 Híbrido': 'HIBRIDO',
      '🟠 Presencial': 'PRESENCIAL',
    };
    const tipo = tipoMap[filtros.tipo] || filtros.tipo;
    conditions.push(`tipo_trabalho = $${paramIndex}`);
    params.push(tipo);
    paramIndex++;
  }

  // Filtro por status
  if (filtros.status && filtros.status !== 'Todos') {
    const statusMap: Record<string, string> = {
      'Pendente': 'pendente',
      'Candidatado': 'candidatado',
      'Entrevista': 'entrevista',
      'Rejeitado': 'rejeitado',
      'Contratado': 'contratado',
    };
    conditions.push(`status_usuario = $${paramIndex}`);
    params.push(statusMap[filtros.status] || filtros.status);
    paramIndex++;
  }

  // Busca textual
  if (filtros.busca) {
    conditions.push(`(titulo ILIKE $${paramIndex} OR empresa ILIKE $${paramIndex} OR localizacao ILIKE $${paramIndex} OR descricao ILIKE $${paramIndex})`);
    params.push(`%${filtros.busca}%`);
    paramIndex++;
  }

  // Filtro ignoradas
  if (!filtros.ignoradas) {
    conditions.push('ignorada = FALSE');
  }

  // Filtro "pra mim"
  if (filtros.apenas_pra_mim) {
    conditions.push('pra_mim = TRUE');
  }

  const whereClause = conditions.join(' AND ');

  // Contar total
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM job_vagas WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  // Buscar vagas
  const offset = (filtros.page - 1) * filtros.per_page;
  const vagasResult = await pool.query(
    `SELECT * FROM job_vagas WHERE ${whereClause}
     ORDER BY score_compatibilidade DESC, data_coleta DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, filtros.per_page, offset]
  );

  return {
    vagas: vagasResult.rows,
    total,
    page: filtros.page,
    per_page: filtros.per_page,
    total_pages: Math.ceil(total / filtros.per_page),
  };
}

/**
 * Atualiza uma vaga
 */
export async function atualizarVaga(id: number, updates: {
  status_usuario?: string;
  notas?: string;
  ignorada?: boolean;
  pra_mim?: boolean;
}): Promise<Vaga | null> {
  const setClauses: string[] = [];
  const params: (string | boolean | number)[] = [];
  let paramIndex = 1;

  if (updates.status_usuario !== undefined) {
    setClauses.push(`status_usuario = $${paramIndex}`);
    params.push(updates.status_usuario);
    paramIndex++;
  }

  if (updates.notas !== undefined) {
    setClauses.push(`notas = $${paramIndex}`);
    params.push(updates.notas);
    paramIndex++;
  }

  if (updates.ignorada !== undefined) {
    setClauses.push(`ignorada = $${paramIndex}`);
    params.push(updates.ignorada);
    paramIndex++;
  }

  if (updates.pra_mim !== undefined) {
    setClauses.push(`pra_mim = $${paramIndex}`);
    params.push(updates.pra_mim);
    paramIndex++;
  }

  if (setClauses.length === 0) return null;

  setClauses.push('updated_at = NOW()');
  params.push(id);

  const result = await pool.query(
    `UPDATE job_vagas SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    params
  );

  return result.rows[0] || null;
}

/**
 * Ignora uma vaga
 */
export async function ignorarVaga(id: number): Promise<void> {
  await pool.query(
    'UPDATE job_vagas SET ignorada = TRUE, updated_at = NOW() WHERE id = $1',
    [id]
  );
}

/**
 * Restaura uma vaga ignorada
 */
export async function restaurarVaga(id: number): Promise<void> {
  await pool.query(
    'UPDATE job_vagas SET ignorada = FALSE, updated_at = NOW() WHERE id = $1',
    [id]
  );
}

/**
 * Toggle "Pra Mim"
 */
export async function toggleFavoritar(id: number): Promise<Vaga | null> {
  const result = await pool.query(
    `UPDATE job_vagas SET pra_mim = NOT pra_mim, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Busca estatísticas gerais
 */
export async function buscarStats(): Promise<Stats> {
  const totalResult = await pool.query('SELECT COUNT(*) FROM job_vagas');
  const plataformasResult = await pool.query(
    'SELECT plataforma, COUNT(*) as total FROM job_vagas GROUP BY plataforma'
  );
  const tiposResult = await pool.query(
    'SELECT tipo_trabalho, COUNT(*) as total FROM job_vagas GROUP BY tipo_trabalho'
  );
  const statusResult = await pool.query(
    'SELECT status_usuario, COUNT(*) as total FROM job_vagas GROUP BY status_usuario'
  );
  const ultimaResult = await pool.query(
    'SELECT MAX(data_coleta) as ultima FROM job_vagas'
  );

  const vagas_por_plataforma: Record<string, number> = {};
  plataformasResult.rows.forEach((row) => {
    vagas_por_plataforma[row.plataforma] = parseInt(row.total);
  });

  const vagas_por_tipo: Record<string, number> = {};
  tiposResult.rows.forEach((row) => {
    vagas_por_tipo[row.tipo_trabalho] = parseInt(row.total);
  });

  const vagas_por_status: Record<string, number> = {};
  statusResult.rows.forEach((row) => {
    vagas_por_status[row.status_usuario] = parseInt(row.total);
  });

  return {
    total_vagas: parseInt(totalResult.rows[0].count),
    total_plataformas: plataformasResult.rows.length,
    vagas_por_plataforma,
    vagas_por_tipo,
    vagas_por_status,
    ultima_coleta: ultimaResult.rows[0]?.ultima?.toISOString() || 'N/A',
  };
}

/**
 * Lista plataformas com contadores
 */
export async function buscarPlataformas(): Promise<Plataforma[]> {
  const result = await pool.query(
    `SELECT plataforma as nome, COUNT(*) as total,
            MAX(data_coleta) as ultima_coleta
     FROM job_vagas
     GROUP BY plataforma
     ORDER BY total DESC`
  );

  return result.rows.map((row) => ({
    nome: row.nome,
    total: parseInt(row.total),
    ultima_coleta: row.ultima_coleta?.toISOString() || 'N/A',
  }));
}
