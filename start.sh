#!/bin/sh

# Executar migrações do banco de dados
echo "Executando migrações do banco de dados..."

# Tentar conectar ao banco e criar as tabelas
npx prisma db push --force-reset || npx prisma db push

echo "Migrações concluídas!"

# Iniciar a aplicação
echo "Iniciando a aplicação..."
exec node server.js