import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Buscar produto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const produto = await prisma.produto.findUnique({
      where: { id: params.id },
      include: {
        remessa: true,
        vendas: {
          include: {
            venda: true,
          },
        },
      },
    })

    if (!produto) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(produto)
  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar produto' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar produto
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Se preço foi alterado, recalcular margem
    let margemLucro = body.margemLucro
    if (body.precoCusto !== undefined || body.precoVenda !== undefined) {
      const produto = await prisma.produto.findUnique({
        where: { id: params.id },
      })

      const custo = body.precoCusto !== undefined ? parseFloat(body.precoCusto) : produto!.precoCusto
      const venda = body.precoVenda !== undefined ? parseFloat(body.precoVenda) : produto!.precoVenda

      margemLucro = ((venda - custo) / custo) * 100
    }

    const produto = await prisma.produto.update({
      where: { id: params.id },
      data: {
        ...(body.nome && { nome: body.nome }),
        ...(body.descricao !== undefined && { descricao: body.descricao }),
        ...(body.fotos && { fotos: JSON.stringify(body.fotos) }),
        ...(body.quantidadeEstoque !== undefined && { quantidadeEstoque: parseInt(body.quantidadeEstoque) }),
        ...(body.precoCusto !== undefined && { precoCusto: parseFloat(body.precoCusto) }),
        ...(body.precoVenda !== undefined && { precoVenda: parseFloat(body.precoVenda) }),
        ...(margemLucro !== undefined && { margemLucro }),
      },
      include: {
        remessa: true,
      },
    })

    return NextResponse.json(produto)
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar produto' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar produto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.produto.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar produto' },
      { status: 500 }
    )
  }
}
