# Sistema de Gestão para Loja de Roupas Femininas

Sistema completo para gerenciamento de estoque, remessas e vendas para loja de roupas femininas.

## Funcionalidades

### Dashboard
- Visão geral do negócio com estatísticas em tempo real
- Investimento total e mensal
- Vendas e lucro realizados
- Projeção de lucro baseada no estoque
- Produtos mais vendidos
- Remessas mais rentáveis
- Filtro por período (mensal)

### Remessas
- Cadastro de remessas com data, custo de viagem e fornecedor
- Visualização de todas as remessas
- Estatísticas detalhadas por remessa:
  - Total investido
  - Total vendido
  - Lucro realizado
  - Projeção de lucro
  - Peças restantes vs. total
  - Percentual vendido
- Status da remessa (ativa/finalizada)

### Produtos
- Cadastro de produtos vinculados a remessas
- Informações completas:
  - Nome e descrição
  - Quantidade inicial e em estoque
  - Preço de custo e venda
  - Margem de lucro (calculada automaticamente)
- Visualização de todos os produtos
- Filtros: Todos, Em Estoque, Esgotados
- Estatísticas:
  - Total de produtos
  - Produtos em estoque
  - Produtos esgotados
  - Valor total em estoque
- Progresso de vendas por produto

### Vendas
- Registro de vendas com múltiplos produtos
- Validação automática de estoque
- Cálculo automático de lucro
- Atualização automática do estoque após venda
- Histórico completo de vendas
- Observações por venda

## Tecnologias Utilizadas

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Estilização**: Tailwind CSS
- **Banco de Dados**: SQLite (via Prisma ORM)
- **Validação**: Zod
- **Ícones**: Lucide React
- **Formatação**: date-fns

## Instalação

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

### Passo a Passo

1. **Entre na pasta do projeto**
```bash
cd loja-roupas
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o banco de dados**
```bash
# Gerar o cliente Prisma
npm run prisma:generate

# Criar o banco de dados
npm run prisma:push
```

4. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

5. **Acesse a aplicação**

Abra seu navegador em [http://localhost:3000](http://localhost:3000)

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
- `npm run prisma:generate` - Gera o cliente Prisma
- `npm run prisma:push` - Sincroniza o schema com o banco de dados
- `npm run prisma:studio` - Abre o Prisma Studio (interface visual do banco)

## Estrutura do Projeto

```
loja-roupas/
├── app/
│   ├── api/              # API Routes
│   │   ├── dashboard/    # Endpoints do dashboard
│   │   ├── produtos/     # CRUD de produtos
│   │   ├── remessas/     # CRUD de remessas
│   │   └── vendas/       # CRUD de vendas
│   ├── produtos/         # Página de produtos
│   ├── remessas/         # Páginas de remessas
│   │   └── [id]/        # Detalhes da remessa
│   ├── vendas/          # Página de vendas
│   ├── layout.tsx       # Layout principal
│   ├── page.tsx         # Dashboard (home)
│   └── globals.css      # Estilos globais
├── components/
│   ├── ui/              # Componentes de UI reutilizáveis
│   └── navbar.tsx       # Barra de navegação
├── lib/
│   ├── prisma.ts        # Cliente Prisma
│   └── utils.ts         # Funções utilitárias
├── prisma/
│   └── schema.prisma    # Schema do banco de dados
├── public/              # Arquivos estáticos
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

## Modelo de Dados

### Remessa
- ID único
- Data da compra
- Custo da viagem
- Fornecedor (opcional)
- Observações (opcional)
- Status (ativa/finalizada)
- Produtos relacionados

### Produto
- ID único
- Nome e descrição
- Fotos (array de URLs)
- Quantidade inicial e em estoque
- Preço de custo e venda
- Margem de lucro (calculada)
- Remessa relacionada

### Venda
- ID único
- Data da venda
- Valor total
- Lucro total
- Observações (opcional)
- Produtos vendidos

### VendaProduto (relação)
- Quantidade vendida
- Preço unitário na venda
- Subtotal
- Lucro unitário

## Fluxo de Uso Recomendado

1. **Criar uma Remessa**
   - Acesse "Remessas" no menu
   - Clique em "Nova Remessa"
   - Preencha data, custo da viagem e fornecedor

2. **Adicionar Produtos à Remessa**
   - Clique em "Ver Detalhes" na remessa criada
   - Clique em "Adicionar Produto"
   - Preencha os dados do produto (nome, quantidade, preços)
   - A margem de lucro é calculada automaticamente

3. **Registrar Vendas**
   - Acesse "Vendas" no menu
   - Clique em "Nova Venda"
   - Selecione os produtos vendidos e quantidades
   - O estoque é atualizado automaticamente

4. **Acompanhar Performance**
   - Use o Dashboard para visão geral
   - Filtre por mês para ver performance mensal
   - Acompanhe as remessas mais rentáveis
   - Monitore o estoque em tempo real

## Funcionalidades Automáticas

- Cálculo de margem de lucro ao cadastrar produto
- Validação de estoque ao registrar venda
- Atualização automática do estoque após venda
- Cálculo de lucro por venda
- Estatísticas em tempo real no dashboard
- Cálculo de ROI por remessa
- Projeção de lucro baseada no estoque restante

## Banco de Dados

O sistema usa SQLite por padrão (arquivo `dev.db` na pasta `prisma/`).

Para visualizar e editar os dados diretamente:
```bash
npm run prisma:studio
```

Isso abrirá uma interface visual em [http://localhost:5555](http://localhost:5555)

## Próximos Passos (Melhorias Futuras)

- Upload de fotos de produtos (integração com Cloudinary)
- Relatórios em PDF
- Gráficos de vendas ao longo do tempo
- Sistema de backup
- Exportação de dados (Excel/CSV)
- Aplicativo móvel
- Sistema de notificações para estoque baixo
- Multi-usuários com autenticação

## Suporte

Para dúvidas ou problemas, consulte a documentação do Next.js: [https://nextjs.org/docs](https://nextjs.org/docs)

## Licença

Este projeto foi criado para uso pessoal/comercial da loja.
