import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar todas as vendas
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const mes = searchParams.get('mes') // formato: YYYY-MM
    const ano = searchParams.get('ano') // formato: YYYY

    let whereClause = {}

    if (mes) {
      const [year, month] = mes.split('-')
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)

      whereClause = {
        dataVenda: {
          gte: startDate,
          lte: endDate,
        },
      }
    } else if (ano) {
      const startDate = new Date(parseInt(ano), 0, 1)
      const endDate = new Date(parseInt(ano), 11, 31, 23, 59, 59)

      whereClause = {
        dataVenda: {
          gte: startDate,
          lte: endDate,
        },
      }
    }

    const vendas = await prisma.venda.findMany({
      where: whereClause,
      include: {
        produtos: {
          include: {
            produto: {
              include: {
                remessa: true,
              },
            },
          },
        },
      },
      orderBy: {
        dataVenda: 'desc',
      },
    })

    return NextResponse.json(vendas)
  } catch (error) {
    console.error('Erro ao buscar vendas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar vendas' },
      { status: 500 }
    )
  }
}

// POST - Registrar nova venda
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dataVenda, produtos, observacoes } = body

    // Validar estoque
    for (const item of produtos) {
      const produto = await prisma.produto.findUnique({
        where: { id: item.produtoId },
      })

      if (!produto) {
        return NextResponse.json(
          { error: `Produto ${item.produtoId} não encontrado` },
          { status: 404 }
        )
      }

      if (produto.quantidadeEstoque < item.quantidade) {
        return NextResponse.json(
          { error: `Estoque insuficiente para o produto ${produto.nome}` },
          { status: 400 }
        )
      }
    }

    // Criar venda com produtos
    const venda = await prisma.venda.create({
      data: {
        dataVenda: new Date(dataVenda),
        valorTotal: 0, // Será atualizado depois
        lucroTotal: 0, // Será atualizado depois
        observacoes,
        produtos: {
          create: produtos.map((item: any) => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
            subtotal: item.quantidade * item.precoUnitario,
            lucroUnitario: item.precoUnitario - item.precoCusto,
          })),
        },
      },
      include: {
        produtos: true,
      },
    })

    // Calcular totais
    const valorTotal = venda.produtos.reduce((sum, p) => sum + p.subtotal, 0)
    const lucroTotal = venda.produtos.reduce(
      (sum, p) => sum + (p.lucroUnitario * p.quantidade),
      0
    )

    // Atualizar venda com totais
    const vendaAtualizada = await prisma.venda.update({
      where: { id: venda.id },
      data: {
        valorTotal,
        lucroTotal,
      },
      include: {
        produtos: {
          include: {
            produto: {
              include: {
                remessa: true,
              },
            },
          },
        },
      },
    })

    // Atualizar estoque dos produtos
    for (const item of produtos) {
      await prisma.produto.update({
        where: { id: item.produtoId },
        data: {
          quantidadeEstoque: {
            decrement: item.quantidade,
          },
        },
      })
    }

    return NextResponse.json(vendaAtualizada, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar venda:', error)
    return NextResponse.json(
      { error: 'Erro ao criar venda' },
      { status: 500 }
    )
  }
}
