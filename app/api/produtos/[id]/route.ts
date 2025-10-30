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

    // Buscar produto atual
    const produtoAtual = await prisma.produto.findUnique({
      where: { id: params.id },
    })

    if (!produtoAtual) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    // Calcular custos
    const precoCusto = body.precoCusto !== undefined ? parseFloat(body.precoCusto) : produtoAtual.precoCusto
    const taxaCartao = body.taxaCartao !== undefined ? parseFloat(body.taxaCartao) : (produtoAtual.taxaCartao || 0)
    const embalagem = body.embalagem !== undefined ? parseFloat(body.embalagem) : (produtoAtual.embalagem || 0)
    const outrosCustos = body.outrosCustos !== undefined ? parseFloat(body.outrosCustos) : (produtoAtual.outrosCustos || 0)
    
    // Calcular custo total
    const custoTotal = precoCusto + taxaCartao + embalagem + outrosCustos

    // Se preço foi alterado, recalcular margem baseada no custo total
    const precoVenda = body.precoVenda !== undefined ? parseFloat(body.precoVenda) : produtoAtual.precoVenda
    const margemLucro = ((precoVenda - custoTotal) / custoTotal) * 100

    const produto = await prisma.produto.update({
      where: { id: params.id },
      data: {
        ...(body.nome && { nome: body.nome }),
        ...(body.descricao !== undefined && { descricao: body.descricao }),
        ...(body.fotos && { fotos: JSON.stringify(body.fotos) }),
        ...(body.quantidadeEstoque !== undefined && { quantidadeEstoque: parseInt(body.quantidadeEstoque) }),
        ...(body.precoCusto !== undefined && { precoCusto }),
        ...(body.precoVenda !== undefined && { precoVenda }),
        ...(body.taxaCartao !== undefined && { taxaCartao }),
        ...(body.embalagem !== undefined && { embalagem }),
        ...(body.outrosCustos !== undefined && { outrosCustos }),
        custoTotal,
        margemLucro,
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
