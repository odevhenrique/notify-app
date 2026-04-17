# Notify App - Controle de Despesas Domésticas

## Descrição

Aplicação para gerenciamento de despesas domésticas, permitindo o cadastro de contas recorrentes, acompanhamento de vencimentos, notificações antecipadas e registro de pagamentos com comprovantes.

## Objetivo

Ajudar usuários a organizar suas finanças e evitar atrasos no pagamento de contas por meio de alertas e controle centralizado.

## Funcionalidades (MVP)

* Cadastro de usuário
* Autenticação (login)
* Cadastro de despesas
* Listagem de despesas
* Atualização de status (pago/pendente)

## Funcionalidades futuras

* Notificações antes do vencimento
* Upload de comprovantes
* Arquivamento automático de despesas pagas
* Relatórios financeiros

## Tecnologias

Backend:

* Python
* FastAPI

Banco de dados:

* SQLite (desenvolvimento)
* PostgreSQL (produção)

Frontend (planejado):

* React Native (Expo)

Serviços externos (planejado):

* Firebase Cloud Messaging (notificações)
* Firebase Storage (armazenamento de arquivos)

## Estrutura do projeto

backend/
app/
main.py
routes/
models/
schemas/
services/
database/
requirements.txt

## Como executar o projeto

### Backend

1. Clonar o repositório:
   git clone https://github.com/seu-usuario/seu-repositorio.git

2. Acessar a pasta:
   cd backend

3. Criar ambiente virtual:
   python -m venv venv

4. Ativar ambiente:
   Windows:
   venv\Scripts\activate

Linux/Mac:
source venv/bin/activate

5. Instalar dependências:
   pip install -r requirements.txt

6. Executar o servidor:
   uvicorn app.main:app --reload

## Endpoints (inicial)

* POST /register
* POST /login
* GET /expenses
* POST /expenses
* PATCH /expenses/{id}

## Status do projeto

Em desenvolvimento

## Autor

Henrique Costa