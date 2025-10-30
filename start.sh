#!/bin/sh

echo "Configurando banco de dados..."

# Usar o binário do Prisma que foi copiado
echo "Criando tabelas no banco de dados..."
./node_modules/prisma/build/index.js db push --schema=./prisma/schema.prisma || {
    echo "Erro ao criar tabelas. Tentando com npx..."
    npx --yes prisma@latest db push --schema=./prisma/schema.prisma
}

echo "Banco de dados configurado com sucesso!"

# Iniciar a aplicação
echo "Iniciando a aplicação..."
exec node server.js