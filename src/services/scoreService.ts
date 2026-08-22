// Serviço de Score de Compatibilidade
// Algoritmo baseado no currículo do Marcos Santos

import pool from '../config/database';

/**
 * Calcula score de compatibilidade para uma vaga
 * Backend (.NET/C#/ASP.NET) = 40 pts máximo
 * Frontend (Angular/TypeScript) = 20 pts máximo
 * Banco de dados (SQL Server/Oracle/PG) = 15 pts máximo
 * Python = 10 pts máximo
 * Remoto ou localização (Gravataí/POA/RS) = 15 pts máximo
 * Senioridade = 5 pts
 */
export function calcularScore(titulo: string, descricao: string, empresa: string): number {
  let score = 0;
  const texto = `${titulo} ${descricao} ${empresa}`.toLowerCase();

  // Backend (.NET/C#/ASP.NET) = 40 pts
  if (/\b(c#|\.net|asp\.net|dotnet|web api|entity framework)\b/i.test(texto)) {
    score += 40;
  }

  // Frontend (Angular/TypeScript) = 20 pts
  if (/\b(angular|typescript|react|vue)\b/i.test(texto)) {
    score += 20;
  }

  // Banco de dados = 15 pts
  if (/\b(sql server|oracle|postgresql|mysql|postgres)\b/i.test(texto)) {
    score += 15;
  }

  // Python = 10 pts
  if (/\bpython|django|flask|fastapi\b/i.test(texto)) {
    score += 10;
  }

  // Remoto ou localização = 15 pts
  if (/remoto|remote|home office|teletrabalho/i.test(texto)) {
    score += 15;
  } else if (/\b(gravataí|porto alegre|poa|rs)\b/i.test(texto)) {
    score += 10;
  }

  // Senioridade = 5 pts
  if (/\b(sênior|senior|lead|pleno)\b/i.test(texto)) {
    score += 5;
  }

  return Math.min(score, 100);
}

/**
 * Recalcula scores para todas as vagas no banco
 */
export async function recalcularTodosScores(): Promise<number> {
  const result = await pool.query('SELECT id, titulo, descricao, empresa FROM job_vagas');
  let atualizadas = 0;

  for (const row of result.rows) {
    const score = calcularScore(row.titulo, row.descricao, row.empresa);
    await pool.query(
      'UPDATE job_vagas SET score_compatibilidade = $1, updated_at = NOW() WHERE id = $2',
      [score, row.id]
    );
    atualizadas++;
  }

  return atualizadas;
}
