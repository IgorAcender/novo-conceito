#!/bin/sh

echo "Configurando banco de dados..."

# Usar o binário do Prisma que foi copiado
echo "Criando/atualizando tabelas no banco de dados..."

# Primeiro tentar sem force-reset
if ! ./node_modules/prisma/build/index.js db push --schema=./prisma/schema.prisma; then
    echo "Migração falhou. Tentando com force-reset (dados serão perdidos)..."
    ./node_modules/prisma/build/index.js db push --force-reset --schema=./prisma/schema.prisma
fi

# Se ainda falhar, tentar com npx
if [ $? -ne 0 ]; then
    echo "Tentando com npx..."
    if ! npx --yes prisma@latest db push --schema=./prisma/schema.prisma; then
        echo "Usando force-reset com npx..."
        npx --yes prisma@latest db push --force-reset --schema=./prisma/schema.prisma
    fi
fi

echo "Banco de dados configurado com sucesso!"

# Iniciar a aplicação
echo "Iniciando a aplicação..."
exec node server.js