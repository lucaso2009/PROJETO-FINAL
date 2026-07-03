# PromoFinder — Instruções de instalação e execução

Estas instruções ajudam a preparar o ambiente local, importar o schema SQL e executar o servidor (com fallback a um `data.json` se você não estiver com MySQL disponível).

## Requisitos
- Node.js (>=16 recomendado)
- npm
- MySQL (opcional; se não houver, o backend usará `BACKEND/data.json`)

## Passos (rápido)
1. Instale dependências:

```bash
npm install
```

2. (Opcional) Criar banco e importar dados SQL

- Se você tem MySQL instalado e deseja usar o banco:

```bash
# no terminal (Linux/macOS ou Git Bash no Windows)
mysql -u root -p < promofinder.sql
# ou importar específico para o DB
mysql -u root -p promofinder < promofinder.sql
```

- Alternativamente, use um cliente (MySQL Workbench, DBeaver) e importe o arquivo `promofinder.sql`.

3. Configurar variáveis de ambiente (opcional)

- Crie o arquivo `BACKEND/.env` copiando `BACKEND/.env.example` e preenchendo as credenciais:

```
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DATABASE=promofinder
PORT=3000
```

- Se não preencher esse `.env`, o servidor continuará funcionando usando `BACKEND/data.json` como fonte de dados.

4. Iniciar o servidor

```bash
npm run start
# para desenvolvimento com reload automático
npm run start:dev
```

5. Acessar

- Abra no navegador: `http://localhost:3000/index.html`
- Painel admin: `http://localhost:3000/ADM/dashboard.html`

## Arquivos importantes
- `BACKEND/server.js` — servidor Express que serve os arquivos estáticos e expõe API: `/api/products`, `/api/users`.
- `BACKEND/db.js` — adaptador: usa MySQL quando o `.env` estiver configurado, senão usa `BACKEND/data.json`.
- `BACKEND/data.json` — dados de fallback com 15 produtos de exemplo.
- `promofinder.sql` — script SQL para criar schema e popular com os 15 produtos.

## Observações
- Ao usar o servidor via `file://` (abrir arquivo HTML direto), as chamadas a `/api/products` não funcionarão; execute o servidor conforme acima.
- Para conectar ao MySQL remotamente, preencha o `.env` com as credenciais corretas.

Se quiser, eu posso:
- Gerar comandos para Windows PowerShell caso prefira (ex.: `Invoke-Sqlcmd` ou `mysql.exe`),
- Ou criar endpoints adicionais para CRUD de produtos no admin.

Qual das duas opções prefere agora? (PowerShell import / CRUD endpoints)

## Correção importante para XAMPP/Apache
Se você abrir o site por `http://localhost:8080`, deixe o servidor Node rodando também em `http://localhost:3000`.
As telas agora enviam cadastro, login e produtos para `http://localhost:3000/api/...` automaticamente quando o site está aberto na porta 8080.

Passos:
1. Abra o XAMPP e ligue MySQL, se for usar banco.
2. No terminal, entre na pasta do projeto.
3. Rode `npm install`.
4. Rode `npm start`.
5. Acesse preferencialmente `http://localhost:3000/cadastro.html` ou, se usar XAMPP, `http://localhost:8080/ProjetoOrlando/cadastro.html` com o Node aberto.
