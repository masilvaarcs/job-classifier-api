# 🔌 Job Classifier — API REST (Node.js) — ⚠️ LEGADO

> **Status: LEGADO (desde 2026-09-11).** Esta API REST não faz mais parte do fluxo ativo do projeto:
> o frontend agora fala **gRPC-Web** com o serviço primário **`job-classifier-dotnet`** (porta 8000).
> Veja a arquitetura atual em [../ARQUITETURA.md](../ARQUITETURA.md) e a migração em
> [../MIGRACAO_GRPC.md](../MIGRACAO_GRPC.md). O código abaixo é mantido como referência histórica.

> Backend com Express + TypeScript + PostgreSQL para gestão de vagas de emprego.

[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org)

---

## 🚀 Funcionalidades

- **API REST** completa com endpoints para CRUD de vagas
- **PostgreSQL** com pool de conexões otimizado
- **Filtros combináveis**: período, plataforma, tipo, status, busca textual
- **Score de compatibilidade** (0-100) baseado no perfil do usuário
- **Importação de dados** do microserviço Python
- **Deduplicação** automática por campo `link`
- **Paginação** e ordenação
- **CORS** configurado para o frontend React

---

## 🛠️ Stack Tecnológica

| Tecnologia | Versão | Uso |
|---|---|---|
| Node.js | 20+ | Runtime |
| TypeScript | 5.6 | Type Safety |
| Express | 4.21 | Web Framework |
| PostgreSQL | 16 | Banco de Dados |
| pg (node-postgres) | 8.13 | Database Driver |
| Zod | 3.23 | Validação |
| dotenv | 16.4 | Variáveis de Ambiente |

---

## 📁 Estrutura do Projeto

```
src/
├── config/
│   └── database.ts        ← Conexão PostgreSQL (pool)
├── controllers/
│   ├── vagasController.ts ← Endpoints de vagas
│   ├── statsController.ts ← Endpoints de estatísticas
│   └── importController.ts← Importação e busca
├── routes/
│   ├── vagas.ts           ← Rotas de vagas
│   ├── stats.ts           ← Rotas de stats
│   ├── buscar.ts          ← Rotas de busca
│   └── index.ts           ← Index de rotas
├── services/
│   ├── vagaService.ts     ← Lógica de negócio
│   ├── scoreService.ts    ← Cálculo de compatibilidade
│   └── importService.ts   ← Importação de dados
├── models/
│   └── vaga.ts            ← Interfaces TypeScript
├── middleware/
│   └── errorHandler.ts    ← Tratamento de erros
└── app.ts                 ← Express app setup
```

---

## ⚙️ Configuração

### Pré-requisitos
- Node.js 20+
- PostgreSQL 16+
- npm ou yarn

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/masilvaarcs/job-classifier-api.git
cd job-classifier-api

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do PostgreSQL

# Criar banco de dados
psql -U postgres -c "CREATE DATABASE job_tracker;"

# Criar tabela
psql -U postgres -d job_tracker -c "
CREATE TABLE job_vagas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(500) NOT NULL,
  empresa VARCHAR(300),
  localizacao VARCHAR(300),
  salario VARCHAR(200),
  modalidade VARCHAR(100),
  publicado VARCHAR(200),
  data_publicacao TIMESTAMP,
  tipo_trabalho VARCHAR(50),
  descricao TEXT,
  link VARCHAR(1000) UNIQUE NOT NULL,
  plataforma VARCHAR(100) NOT NULL,
  job_id VARCHAR(100),
  data_coleta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status_usuario VARCHAR(50) DEFAULT 'pendente',
  ignorada BOOLEAN DEFAULT FALSE,
  pra_mim BOOLEAN DEFAULT FALSE,
  score_compatibilidade INTEGER DEFAULT 0,
  data_verificacao TIMESTAMP,
  ativa BOOLEAN DEFAULT TRUE,
  notas TEXT
);"

# Iniciar servidor de desenvolvimento
npm run dev
```

Acessar: `http://localhost:8000`

---

## 📡 API Endpoints

### Informação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api` | Info da API |
| GET | `/api/status` | Status de buscas em andamento |

### Vagas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/vagas` | Listar vagas (filtros combináveis) |
| PUT | `/api/vagas/:id/status` | Atualizar status, notas, ignorar, favoritar |
| POST | `/api/vagas/:id/ignorar` | Marcar vaga como ignorada |
| POST | `/api/vagas/:id/restaurar` | Restaurar vaga ignorada |
| POST | `/api/vagas/:id/favoritar` | Toggle "Vagas pra mim" |

### Estatísticas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/stats` | Estatísticas gerais do banco |
| GET | `/api/plataformas` | Lista de plataformas com contadores |

### Busca e Importação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/buscar/todas` | Buscar todas as plataformas |
| POST | `/api/buscar/:plataforma` | Buscar plataforma específica |
| POST | `/api/importar` | Importar dados do microserviço |
| POST | `/api/calcular-scores` | Recalcular scores de compatibilidade |

### Parâmetros de Filtro (`/api/vagas`)
| Parâmetro | Tipo | Descrição |
|---|---|---|
| `dias` | number | 0 (24h), 5, 10, 15, ou omitido (todas) |
| `plataforma` | string | LinkedIn, Indeed, Jooble, Freelancer, Glassdoor, BNE |
| `tipo` | string | REMOTO, HIBRIDO, PRESENCIAL |
| `busca` | string | Texto livre (ILIKE) |
| `status` | string | pendente, candidatado, entrevista, rejeitado, contratado |
| `ignoradas` | boolean | true para incluir ignoradas |
| `apenas_pra_mim` | boolean | true para mostrar apenas favoritas |
| `page` | number | Página (default: 1) |
| `per_page` | number | Itens por página (default: 20) |

---

## 📦 Build para Produção

```bash
npm run build
npm start
```

---

## 🧪 Scripts Disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor com hot-reload (tsx watch) |
| `npm run build` | Build TypeScript |
| `npm start` | Iniciar em produção |
| `npm run lint` | Verificação de código |
| `npm run typecheck` | Type checking |

---

## 🔗 Comunicação com Outros Serviços

### Frontend React (porta 5173)
O frontend se comunica com esta API via proxy do Vite.

### Microserviço Python (porta 8001)
A API pode chamar o microserviço para scraping:
```typescript
// Exemplo de chamada ao microserviço
const response = await axios.post('http://localhost:8001/scraping/todas');
```

---

## 📋 Projeto Completo

Este repositório faz parte do projeto **Job Classifier**, composto por:

| Repositório | Tecnologia | Descrição |
|---|---|---|
| [job-classifier-react](https://github.com/masilvaarcs/job-classifier-react) | React + TypeScript | Frontend |
| [job-classifier-api](https://github.com/masilvaarcs/job-classifier-api) | Node.js + Express | API REST (este repositório) |
| [job-classifier-python](https://github.com/masilvaarcs/job-classifier-python) | Python + FastAPI | Microserviço de scraping |

---

## 👤 Autor

**Marcos Santos da Silva**
- Desenvolvedor Full Stack Sênior
- [GitHub](https://github.com/masilvaarcs)
- [LinkedIn](https://linkedin.com/in/marcosprogramador)

---

## 📄 Licença

MIT
