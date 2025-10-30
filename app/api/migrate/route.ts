import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Forçar modo dinâmico para esta rota
export const dynamic = 'force-dynamic'

// POST - Migrar dados dos produtos existentes
export async function POST(request: NextRequest) {
  try {
    console.log('Iniciando migração de dados dos produtos...')

    // Buscar todos os produtos que não têm custoTotal definido (produtos antigos)
    const produtosAntigos = await prisma.produto.findMany({
      where: {
        OR: [
          { custoTotal: null },
          { custoTotal: 0 },
        ]
      }
    })

    console.log(`Encontrados ${produtosAntigos.length} produtos para migrar`)

    let migrados = 0
    for (const produto of produtosAntigos) {
      // Para produtos antigos, definir custoTotal = precoCusto
      // e recalcular margem baseada apenas no custo básico
      const custoTotal = produto.precoCusto
      const margemLucro = ((produto.precoVenda - custoTotal) / custoTotal) * 100

      await prisma.produto.update({
        where: { id: produto.id },
        data: {
          taxaCartao: 0,
          embalagem: 0,
          outrosCustos: 0,
          custoTotal,
          margemLucro,
        }
      })

      migrados++
      console.log(`Migrado produto: ${produto.nome}`)
    }

    console.log(`Migração concluída. ${migrados} produtos migrados.`)

    return NextResponse.json({
      success: true,
      message: `Migração concluída com sucesso. ${migrados} produtos migrados.`,
      migrados
    })

  } catch (error) {
    console.error('Erro na migração:', error)
    return NextResponse.json(
      { 
        error: 'Erro na migração de dados',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}