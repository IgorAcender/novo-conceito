import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Forçar modo dinâmico para esta rota
export const dynamic = 'force-dynamic'

// GET - Listar todas as remessas
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    const remessas = await prisma.remessa.findMany({
      where: status ? { status } : undefined,
      include: {
        produtos: true,
      },
      orderBy: {
        dataCompra: 'desc',
      },
    })

    // Calcular estatísticas para cada remessa
    const remessasComEstatisticas = remessas.map(remessa => {
      const totalInvestido = remessa.custoViagem +
        remessa.produtos.reduce((sum, p) => sum + (p.precoCusto * p.quantidadeInicial), 0)

      const totalVendido = remessa.produtos.reduce(
        (sum, p) => sum + ((p.quantidadeInicial - p.quantidadeEstoque) * p.precoVenda),
        0
      )

      const lucroRealizado = totalVendido -
        remessa.produtos.reduce(
          (sum, p) => sum + ((p.quantidadeInicial - p.quantidadeEstoque) * p.precoCusto),
          0
        ) - (remessa.custoViagem * (totalVendido / (remessa.produtos.reduce((sum, p) => sum + (p.quantidadeInicial * p.precoVenda), 0) || 1)))

      const projecaoLucro = remessa.produtos.reduce(
        (sum, p) => sum + (p.quantidadeEstoque * (p.precoVenda - p.precoCusto)),
        0
      )

      const pecasRestantes = remessa.produtos.reduce((sum, p) => sum + p.quantidadeEstoque, 0)
      const totalPecas = remessa.produtos.reduce((sum, p) => sum + p.quantidadeInicial, 0)

      return {
        ...remessa,
        estatisticas: {
          totalInvestido,
          totalVendido,
          lucroRealizado,
          projecaoLucro,
          pecasRestantes,
          totalPecas,
          percentualVendido: totalPecas > 0 ? ((totalPecas - pecasRestantes) / totalPecas) * 100 : 0,
        }
      }
    })

    return NextResponse.json(remessasComEstatisticas)
  } catch (error) {
    console.error('Erro ao buscar remessas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar remessas' },
      { status: 500 }
    )
  }
}

// POST - Criar nova remessa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dataCompra, custoViagem, fornecedor, observacoes } = body

    const remessa = await prisma.remessa.create({
      data: {
        dataCompra: new Date(dataCompra),
        custoViagem: parseFloat(custoViagem),
        fornecedor,
        observacoes,
        status: 'ativa',
      },
    })

    return NextResponse.json(remessa, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar remessa:', error)
    return NextResponse.json(
      { error: 'Erro ao criar remessa' },
      { status: 500 }
    )
  }
}
