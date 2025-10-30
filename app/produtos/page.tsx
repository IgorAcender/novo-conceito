'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, formatPercentage } from '@/lib/utils'
import { Package, AlertCircle } from 'lucide-react'

interface Produto {
  id: string
  nome: string
  descricao: string | null
  quantidadeInicial: number
  quantidadeEstoque: number
  precoCusto: number
  precoVenda: number
  margemLucro: number
  taxaCartao?: number
  embalagem?: number
  outrosCustos?: number
  custoTotal?: number
  createdAt: string
  remessa: {
    id: string
    fornecedor: string | null
    dataCompra: string
  }
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'todos' | 'estoque' | 'esgotado'>('todos')

  useEffect(() => {
    fetchProdutos()
  }, [])

  async function fetchProdutos() {
    try {
      const response = await fetch('/api/produtos')
      const data = await response.json()
      setProdutos(data)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  const produtosFiltrados = produtos.filter(produto => {
    if (filtro === 'estoque') return produto.quantidadeEstoque > 0
    if (filtro === 'esgotado') return produto.quantidadeEstoque === 0
    return true
  })

  const totalProdutos = produtos.length
  const emEstoque = produtos.filter(p => p.quantidadeEstoque > 0).length
  const esgotados = produtos.filter(p => p.quantidadeEstoque === 0).length
  const valorTotalEstoque = produtos.reduce((sum, p) => sum + (p.quantidadeEstoque * p.precoCusto), 0)

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
        <p className="text-muted-foreground">
          Todos os produtos cadastrados no sistema
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProdutos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Estoque</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{emEstoque}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esgotados</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{esgotados}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor em Estoque</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(valorTotalEstoque)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <button
          onClick={() => setFiltro('todos')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filtro === 'todos'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Todos ({totalProdutos})
        </button>
        <button
          onClick={() => setFiltro('estoque')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filtro === 'estoque'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Em Estoque ({emEstoque})
        </button>
        <button
          onClick={() => setFiltro('esgotado')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filtro === 'esgotado'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Esgotados ({esgotados})
        </button>
      </div>

      {/* Lista de produtos */}
      {produtosFiltrados.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhum produto encontrado</p>
            <Link href="/remessas">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                Ir para Remessas
              </button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {produtosFiltrados.map((produto) => {
            const quantidadeVendida = produto.quantidadeInicial - produto.quantidadeEstoque
            const percentualVendido = (quantidadeVendida / produto.quantidadeInicial) * 100

            return (
              <Card key={produto.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{produto.nome}</CardTitle>
                      <CardDescription>
                        {produto.remessa.fornecedor || 'Sem fornecedor'}
                      </CardDescription>
                    </div>
                    {produto.quantidadeEstoque === 0 ? (
                      <Badge variant="destructive">Esgotado</Badge>
                    ) : produto.quantidadeEstoque <= 3 ? (
                      <Badge variant="outline" className="border-orange-500 text-orange-500">
                        Baixo
                      </Badge>
                    ) : (
                      <Badge variant="success">Disponível</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {produto.descricao && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {produto.descricao}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Estoque</p>
                      <p className="font-medium">
                        {produto.quantidadeEstoque} / {produto.quantidadeInicial}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Vendidos</p>
                      <p className="font-medium">{quantidadeVendida}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Custo</p>
                      <p className="font-medium">{formatCurrency(produto.precoCusto)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Venda</p>
                      <p className="font-medium">{formatCurrency(produto.precoVenda)}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Margem</span>
                      <span className="font-medium text-green-600">
                        {formatPercentage(produto.margemLucro)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progresso de vendas</span>
                      <span className="font-medium">
                        {formatPercentage(percentualVendido)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentualVendido}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t flex items-center justify-between">
                    <Link href={`/remessas/${produto.remessa.id}`}>
                      <button className="text-xs text-primary hover:underline">
                        Ver remessa ({formatDate(produto.remessa.dataCompra)})
                      </button>
                    </Link>
                    <Link href={`/produtos/${produto.id}`}>
                      <button className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90">
                        Editar
                      </button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
