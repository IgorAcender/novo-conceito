'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { TrendingUp, DollarSign, Package, ShoppingBag, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface DashboardData {
  periodo: string
  investimento: {
    total: number
    mes: number
  }
  vendas: {
    total: number
    quantidade: number
  }
  lucro: {
    realizado: number
    projecao: number
  }
  estoque: {
    pecas: number
    valor: number
  }
  topProdutos: Array<{
    nome: string
    quantidade: number
    receita: number
  }>
  topRemessas: Array<{
    id: string
    fornecedor: string | null
    dataCompra: string
    totalInvestido: number
    lucroRealizado: number
    roi: number
  }>
  margemMedia: number
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [mesSelecionado, setMesSelecionado] = useState<string>('')

  useEffect(() => {
    fetchDashboard()
  }, [mesSelecionado])

  async function fetchDashboard() {
    try {
      const url = mesSelecionado
        ? `/api/dashboard?mes=${mesSelecionado}`
        : '/api/dashboard'

      const response = await fetch(url)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  // Gerar opções de meses (últimos 12 meses)
  const getMesesOptions = () => {
    const meses = []
    const hoje = new Date()
    for (let i = 0; i < 12; i++) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const valor = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      const label = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      meses.push({ valor, label })
    }
    return meses
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Erro ao carregar dados</p>
      </div>
    )
  }

  const lucroLiquido = data.vendas.total - (mesSelecionado ? data.investimento.mes : 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do seu negócio
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Todos os períodos</option>
            {getMesesOptions().map(({ valor, label }) => (
              <option key={valor} value={valor}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards de estatísticas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {mesSelecionado ? 'Investimento do Mês' : 'Investimento Total'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(mesSelecionado ? data.investimento.mes : data.investimento.total)}
            </div>
            {mesSelecionado && (
              <p className="text-xs text-muted-foreground">
                Total geral: {formatCurrency(data.investimento.total)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.vendas.total)}</div>
            <p className="text-xs text-muted-foreground">
              {data.vendas.quantidade} {data.vendas.quantidade === 1 ? 'venda' : 'vendas'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Realizado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.lucro.realizado)}
            </div>
            <p className="text-xs text-muted-foreground">
              Margem média: {formatPercentage(data.margemMedia)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.estoque.pecas}</div>
            <p className="text-xs text-muted-foreground">
              Valor: {formatCurrency(data.estoque.valor)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projeção de Lucro */}
      <Card>
        <CardHeader>
          <CardTitle>Projeção de Lucro</CardTitle>
          <CardDescription>
            Lucro estimado se vender todo o estoque restante
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Lucro Realizado</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(data.lucro.realizado)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Projeção (Estoque)</span>
              <span className="text-lg font-bold text-blue-600">
                {formatCurrency(data.lucro.projecao)}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Lucro Total Projetado</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(data.lucro.realizado + data.lucro.projecao)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Produtos mais vendidos */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
            <CardDescription>Top 5 produtos por quantidade</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topProdutos.length > 0 ? (
              <div className="space-y-4">
                {data.topProdutos.map((produto, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{produto.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {produto.quantidade} unidades
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatCurrency(produto.receita)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma venda registrada</p>
            )}
          </CardContent>
        </Card>

        {/* Remessas mais rentáveis */}
        <Card>
          <CardHeader>
            <CardTitle>Remessas Mais Rentáveis</CardTitle>
            <CardDescription>Top 5 por ROI</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topRemessas.length > 0 ? (
              <div className="space-y-4">
                {data.topRemessas.map((remessa) => (
                  <div key={remessa.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {remessa.fornecedor || 'Sem fornecedor'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(remessa.dataCompra).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {remessa.roi >= 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${remessa.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercentage(remessa.roi)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(remessa.lucroRealizado)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma remessa cadastrada</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
