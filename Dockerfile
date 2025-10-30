# Use a imagem oficial do Node.js como base
FROM node:18-alpine AS base

# Adicionar dependências necessárias para Prisma
RUN apk add --no-cache libc6-compat openssl

# Instalar dependências apenas quando necessário
FROM base AS deps
# Adicionar ferramentas de build para dependências nativas
RUN apk add --no-cache python3 make g++
WORKDIR /app

# Instalar dependências baseadas no gerenciador de pacotes preferido
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  else npm install; \
  fi

# Reconstruir o código fonte apenas quando necessário
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Gerar o cliente Prisma
RUN npx prisma generate

# Fazer o build da aplicação Next.js
RUN npm run build

# Imagem de produção, copiar todos os arquivos e executar o next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Descommentar a linha seguinte para desabilitar a telemetria durante a execução.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Criar pasta public e copiar conteúdo se existir
RUN mkdir -p ./public
COPY --from=builder /app/public ./public

# Definir as permissões corretas para cache pré-renderizado
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Aproveitar automaticamente as saídas rastreadas para reduzir o tamanho da imagem
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar arquivos necessários para Prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma/
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma/
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma/
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma/

# Copiar script de inicialização
COPY --from=builder /app/start.sh ./start.sh
RUN chmod +x start.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./start.sh"]