import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Dashboard com estatísticas gerais
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const mes = searchParams.get('mes') // formato: YYYY-MM

    let startDate: Date | undefined
    let endDate: Date | undefined

    if (mes) {
      const [year, month] = mes.split('-')
      startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
    }

    // Buscar todas as remessas
    const remessas = await prisma.remessa.findMany({
      include: {
        produtos: {
          include: {
            vendas: {
              include: {
                venda: true,
              },
            },
          },
        },
      },
    })

    // Buscar vendas do período
    const vendas = await prisma.venda.findMany({
      where: startDate && endDate ? {
        dataVenda: {
          gte: startDate,
          lte: endDate,
        },
      } : undefined,
      include: {
        produtos: {
          include: {
            produto: true,
          },
        },
      },
    })

    // Calcular investimento total
    const investimentoTotal = remessas.reduce((sum, r) => {
      const custoProdutos = r.produtos.reduce(
        (s, p) => s + (p.precoCusto * p.quantidadeInicial),
        0
      )
      return sum + r.custoViagem + custoProdutos
    }, 0)

    // Calcular investimento do mês (apenas remessas do mês)
    const investimentoMes = mes ? remessas
      .filter(r => {
        const dataRemessa = new Date(r.dataCompra)
        return dataRemessa >= startDate! && dataRemessa <= endDate!
      })
      .reduce((sum, r) => {
        const custoProdutos = r.produtos.reduce(
          (s, p) => s + (p.precoCusto * p.quantidadeInicial),
          0
        )
        return sum + r.custoViagem + custoProdutos
      }, 0) : 0

    // Calcular vendas e lucro
    const vendasTotal = vendas.reduce((sum, v) => sum + v.valorTotal, 0)
    const lucroTotal = vendas.reduce((sum, v) => sum + v.lucroTotal, 0)

    // Estoque atual
    const estoqueAtual = remessas.reduce((sum, r) => {
      return sum + r.produtos.reduce((s, p) => s + p.quantidadeEstoque, 0)
    }, 0)

    const valorEstoque = remessas.reduce((sum, r) => {
      return sum + r.produtos.reduce(
        (s, p) => s + (p.quantidadeEstoque * p.precoCusto),
        0
      )
    }, 0)

    // Projeção de lucro (estoque restante)
    const projecaoLucro = remessas.reduce((sum, r) => {
      return sum + r.produtos.reduce(
        (s, p) => s + (p.quantidadeEstoque * (p.precoVenda - p.precoCusto)),
        0
      )
    }, 0)

    // Produtos mais vendidos
    const produtosVendidos: { [key: string]: { nome: string; quantidade: number; receita: number } } = {}

    vendas.forEach(venda => {
      venda.produtos.forEach(vp => {
        if (!produtosVendidos[vp.produtoId]) {
          produtosVendidos[vp.produtoId] = {
            nome: vp.produto.nome,
            quantidade: 0,
            receita: 0,
          }
        }
        produtosVendidos[vp.produtoId].quantidade += vp.quantidade
        produtosVendidos[vp.produtoId].receita += vp.subtotal
      })
    })

    const topProdutos = Object.values(produtosVendidos)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5)

    // Remessas mais rentáveis
    const remessasRentabilidade = remessas.map(remessa => {
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

      return {
        id: remessa.id,
        fornecedor: remessa.fornecedor,
        dataCompra: remessa.dataCompra,
        totalInvestido,
        lucroRealizado,
        roi: totalInvestido > 0 ? (lucroRealizado / totalInvestido) * 100 : 0,
      }
    })
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 5)

    const dashboard = {
      periodo: mes || 'geral',
      investimento: {
        total: investimentoTotal,
        mes: investimentoMes,
      },
      vendas: {
        total: vendasTotal,
        quantidade: vendas.length,
      },
      lucro: {
        realizado: lucroTotal,
        projecao: projecaoLucro,
      },
      estoque: {
        pecas: estoqueAtual,
        valor: valorEstoque,
      },
      topProdutos,
      topRemessas: remessasRentabilidade,
      margemMedia: vendasTotal > 0 ? (lucroTotal / vendasTotal) * 100 : 0,
    }

    return NextResponse.json(dashboard)
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dashboard' },
      { status: 500 }
    )
  }
}
