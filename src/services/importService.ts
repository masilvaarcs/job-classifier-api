import pool from '../config/database';
import type { VagaCreate } from '../models/vaga';
import { calcularScore } from './scoreService';

/**
 * Importa uma lista de vagas para o banco (dedup por link)
 */
export async function importarVagas(vagas: VagaCreate[]): Promise<{ importadas: number; atualizadas: number }> {
  let importadas = 0;
  let atualizadas = 0;

  for (const vaga of vagas) {
    try {
      const score = calcularScore(
        vaga.titulo,
        vaga.descricao || '',
        vaga.empresa || ''
      );

      const result = await pool.query(
        `INSERT INTO job_vagas (
          titulo, empresa, localizacao, salario, modalidade, publicado,
          data_publicacao, tipo_trabalho, descricao, link, job_id, plataforma,
          score_compatibilidade
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (link) DO UPDATE SET
          titulo = EXCLUDED.titulo,
          empresa = EXCLUDED.empresa,
          localizacao = EXCLUDED.localizacao,
          salario = EXCLUDED.salario,
          modalidade = EXCLUDED.modalidade,
          publicado = EXCLUDED.publicado,
          data_publicacao = EXCLUDED.data_publicacao,
          tipo_trabalho = EXCLUDED.tipo_trabalho,
          descricao = EXCLUDED.descricao,
          updated_at = NOW()
        RETURNING (xmax = 0) as inserted`,
        [
          vaga.titulo,
          vaga.empresa || '',
          vaga.localizacao || '',
          vaga.salario || '',
          vaga.modalidade || '',
          vaga.publicado || '',
          vaga.data_publicacao || null,
          vaga.tipo_trabalho || 'NAO IDENTIFICADO',
          vaga.descricao || '',
          vaga.link,
          vaga.job_id || '',
          vaga.plataforma,
          score,
        ]
      );

      if (result.rows[0]?.inserted) {
        importadas++;
      } else {
        atualizadas++;
      }
    } catch (err) {
      console.error(`Erro ao importar vaga "${vaga.titulo}":`, err);
    }
  }

  return { importadas, atualizadas };
}
