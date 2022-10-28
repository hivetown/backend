# RF03

## Setup

1. Copiar variáveis de ambiente e editar variáveis de ambiente (`.env`)
    1. `cp .env.example .env`

## Desenvolver (no vscode)

Pode-se usar `npm run` no lugar de `yarn` para executar os comandos.

1. Abrir um terminal no vscode (CTRL+J)
2. Fazer split ao terminal (CTRL+SHIFT+5) ou naquele icon que fica no canto superior direito do terminal que parece uma janelinha
3. Num dos terminais
    1. `yarn watch` - se quisermos compilar quando fizermos alterações
    2. `yarn build` - se quisermos compilar manualmente
4. Noutro terminal
    1. `yarn dev` - se quisermos correr a app e que ela recarregue quando compilarmos
    2. `node .` - se quisermos correr a app manualmente
