#!/bin/sh

# Executar migrações do banco de dados
echo "Executando migrações do banco de dados..."
npx prisma db push

# Iniciar a aplicação
echo "Iniciando a aplicação..."
exec node server.js