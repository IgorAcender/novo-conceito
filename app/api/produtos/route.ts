import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Forçar modo dinâmico para esta rota
export const dynamic = 'force-dynamic'

// GET - Listar todos os produtos
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const remessaId = searchParams.get('remessaId')

    const produtos = await prisma.produto.findMany({
      where: remessaId ? { remessaId } : undefined,
      include: {
        remessa: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(produtos)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    )
  }
}

// POST - Criar novo produto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      nome,
      descricao,
      fotos,
      quantidadeInicial,
      precoCusto,
      precoVenda,
      remessaId,
    } = body

    // Calcular margem de lucro
    const margemLucro = ((parseFloat(precoVenda) - parseFloat(precoCusto)) / parseFloat(precoCusto)) * 100

    const produto = await prisma.produto.create({
      data: {
        nome,
        descricao,
        fotos: JSON.stringify(fotos || []),
        quantidadeInicial: parseInt(quantidadeInicial),
        quantidadeEstoque: parseInt(quantidadeInicial),
        precoCusto: parseFloat(precoCusto),
        precoVenda: parseFloat(precoVenda),
        margemLucro,
        remessaId,
      },
      include: {
        remessa: true,
      },
    })

    return NextResponse.json(produto, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 500 }
    )
  }
}
