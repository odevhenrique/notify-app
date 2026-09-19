# Notify App - Controle de Despesas Domésticas

## Descrição

Aplicação para gerenciamento de despesas domésticas, permitindo o cadastro de contas recorrentes, acompanhamento de vencimentos, notificações antecipadas e registro de pagamentos com comprovantes.

## Objetivo

Ajudar usuários a organizar suas finanças e evitar atrasos no pagamento de contas por meio de alertas e controle centralizado.

## Funcionalidades

* Cadastro público de usuário (qualquer pessoa pode criar sua conta)
* Autenticação (login) com JWT
* Recuperação de senha por e-mail (código de verificação)
* Cadastro, listagem e atualização de status de despesas (pago/pendente)
* Notificações locais antes do vencimento
* Upload de comprovante de pagamento
* Arquivamento de despesas pagas
* Painel administrativo (gerenciar usuários e e-mails autorizados)

## Funcionalidades futuras

* Relatórios financeiros

## Tecnologias

Backend:

* Python
* FastAPI

Banco de dados:

* PostgreSQL

Frontend:

* React Native (Expo), com suporte a Android e Web

Serviços externos:

* Resend (envio de e-mails de recuperação de senha)
* Cloudinary (armazenamento de comprovantes)
* Expo Notifications (notificações locais)

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

## Endpoints (principais)

* POST /auth/register
* POST /auth/login
* POST /auth/forgot-password
* POST /auth/reset-password
* PUT /auth/change-password
* GET /expenses/
* POST /expenses/
* PUT /expenses/{id}/pay
* DELETE /expenses/{id}
* POST /upload/receipt

## Download

[Baixar APK (Android)](https://expo.dev/artifacts/eas/TVujyh3hI_0kvaoTAVSHX8TSUQ9tOODVsutAg4BR5VE.apk)

## Status do projeto

Em desenvolvimento

## Autor

Henrique Costa