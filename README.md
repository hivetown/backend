# RF03

## Requirements

1. Node.js (v18.10.0)
2. Yarn (v3.2.4) ou NPM (v8.19.2)
3. MySQL (15.1 Distrib 10.9.3-MariaDB, for Linux (x86_64) using readline 5.1)

## Setup

Nota: Pode-se usar `npm run` no lugar de `yarn` para executar os comandos.

1. Copiar variáveis de ambiente
    - `cp .env.example .env`
2. Editar variáveis de ambiente conforme necessário
    - `nano .env`
3. Instalar dependências
    - `yarn install`
4. Criar base de dados conforme configurado em `.env`
5. Atualizar base de dados com as migrações
    - `yarn mikro-orm migration:up` (ou `npx mikro-orm migration:up`)

## Processo de Desenvolvimento

Nota: Pode-se usar `npm run` no lugar de `yarn` para executar os comandos.
Shortcuts do vscode entre parênteses.

1. Abrir um terminal (CTRL+J)
2. Fazer split ao terminal (CTRL+SHIFT+5) ou pelo icon que fica no canto superior direito do terminal que parece uma janelinha
3. Num dos terminais
    - `yarn watch` - se quisermos compilar quando fizermos alterações
    - `yarn build` - se quisermos compilar manualmente
4. Noutro terminal
    - `yarn dev` - se quisermos correr a app e que ela recarregue quando compilarmos
    - `node .` - se quisermos correr a app manualmente
5. Desenvolver

Aquando alterações à base de dados, é necessário migrar.
Para criar uma migração, usar `yarn mikro-orm migration:create` (ou `npx mikro-orm migration:create`) e depois atualizar aplicar à base de dados com `yarn mikro-orm migration:up` (ou `npx mikro-orm migration:up`).

> Rebuçados
