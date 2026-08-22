// Interface que representa uma vaga no banco de dados

export interface Vaga {
  id: number;
  titulo: string;
  empresa: string;
  localizacao: string;
  salario: string;
  modalidade: string;
  publicado: string;
  data_publicacao: Date | null;
  tipo_trabalho: 'REMOTO' | 'HIBRIDO' | 'PRESENCIAL' | 'NAO IDENTIFICADO';
  descricao: string;
  link: string;
  job_id: string;
  plataforma: string;
  data_coleta: Date;
  created_at: Date;
  updated_at: Date;
  status_usuario: 'pendente' | 'candidatado' | 'entrevista' | 'rejeitado' | 'contratado';
  ignorada: boolean;
  pra_mim: boolean;
  score_compatibilidade: number;
  data_verificacao: Date | null;
  ativa: boolean;
  notas: string;
}

export interface VagaCreate {
  titulo: string;
  empresa?: string;
  localizacao?: string;
  salario?: string;
  modalidade?: string;
  publicado?: string;
  data_publicacao?: string;
  tipo_trabalho?: string;
  descricao?: string;
  link: string;
  job_id?: string;
  plataforma: string;
}

export interface VagaUpdate {
  status_usuario?: string;
  notas?: string;
  ignorada?: boolean;
  pra_mim?: boolean;
}

export interface Filtros {
  dias?: number;
  plataforma?: string;
  tipo?: string;
  busca?: string;
  status?: string;
  ignoradas?: boolean;
  apenas_pra_mim?: boolean;
  page: number;
  per_page: number;
}

export interface PaginacaoResponse {
  vagas: Vaga[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface Stats {
  total_vagas: number;
  total_plataformas: number;
  vagas_por_plataforma: Record<string, number>;
  vagas_por_tipo: Record<string, number>;
  vagas_por_status: Record<string, number>;
  ultima_coleta: string;
}

export interface Plataforma {
  nome: string;
  total: number;
  ultima_coleta: string;
}

export interface BuscaStatus {
  em_andamento: boolean;
  plataformas_em_execucao: string[];
  ultima_execucao: string;
}
