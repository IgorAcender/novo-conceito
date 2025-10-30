'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, formatPercentage } from '@/lib/utils'
import { ArrowLeft, Plus, Package, DollarSign, TrendingUp, Edit, Trash2 } from 'lucide-react'

interface Produto {
  id: string
  nome: string
  descricao: string | null
  fotos: string
  quantidadeInicial: number
  quantidadeEstoque: number
  precoCusto: number
  precoVenda: number
  margemLucro: number
}

interface Remessa {
  id: string
  dataCompra: string
  custoViagem: number
  fornecedor: string | null
  observacoes: string | null
  status: string
  produtos: Produto[]
}

export default function DetalhesRemessa() {
  const params = useParams()
  const router = useRouter()
  const [remessa, setRemessa] = useState<Remessa | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModalProduto, setShowModalProduto] = useState(false)
  const [formProduto, setFormProduto] = useState({
    nome: '',
    descricao: '',
    quantidadeInicial: '',
    precoCusto: '',
    precoVenda: '',
  })

  useEffect(() => {
    fetchRemessa()
  }, [params.id])

  async function fetchRemessa() {
    try {
      const response = await fetch(`/api/remessas/${params.id}`)
      const data = await response.json()
      setRemessa(data)
    } catch (error) {
      console.error('Erro ao carregar remessa:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitProduto(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formProduto,
          remessaId: params.id,
        }),
      })

      if (response.ok) {
        setShowModalProduto(false)
        setFormProduto({
          nome: '',
          descricao: '',
          quantidadeInicial: '',
          precoCusto: '',
          precoVenda: '',
        })
        fetchRemessa()
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (!remessa) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">Remessa não encontrada</p>
        <Link href="/remessas">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>
    )
  }

  // Calcular estatísticas
  const totalInvestido = remessa.custoViagem +
    remessa.produtos.reduce((sum, p) => sum + (p.precoCusto * p.quantidadeInicial), 0)

  const totalVendido = remessa.produtos.reduce(
    (sum, p) => sum + ((p.quantidadeInicial - p.quantidadeEstoque) * p.precoVenda),
    0
  )

  const custoVendido = remessa.produtos.reduce(
    (sum, p) => sum + ((p.quantidadeInicial - p.quantidadeEstoque) * p.precoCusto),
    0
  )

  const percentualVendido = remessa.produtos.reduce((sum, p) => sum + p.quantidadeInicial, 0) > 0
    ? ((remessa.produtos.reduce((sum, p) => sum + p.quantidadeInicial, 0) -
      remessa.produtos.reduce((sum, p) => sum + p.quantidadeEstoque, 0)) /
      remessa.produtos.reduce((sum, p) => sum + p.quantidadeInicial, 0)) * 100
    : 0

  const custoViagemProporcional = remessa.custoViagem * (percentualVendido / 100)
  const lucroRealizado = totalVendido - custoVendido - custoViagemProporcional

  const projecaoLucro = remessa.produtos.reduce(
    (sum, p) => sum + (p.quantidadeEstoque * (p.precoVenda - p.precoCusto)),
    0
  ) - (remessa.custoViagem - custoViagemProporcional)

  const pecasRestantes = remessa.produtos.reduce((sum, p) => sum + p.quantidadeEstoque, 0)
  const totalPecas = remessa.produtos.reduce((sum, p) => sum + p.quantidadeInicial, 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/remessas">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {remessa.fornecedor || 'Remessa sem fornecedor'}
            </h1>
            <p className="text-muted-foreground">
              Compra em {formatDate(remessa.dataCompra)}
            </p>
          </div>
        </div>
        <Badge variant={remessa.status === 'ativa' ? 'default' : 'secondary'}>
          {remessa.status}
        </Badge>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investimento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvestido)}</div>
            <p className="text-xs text-muted-foreground">
              Viagem: {formatCurrency(remessa.custoViagem)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalVendido)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(percentualVendido)} vendido
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
              {formatCurrency(lucroRealizado)}
            </div>
            <p className="text-xs text-muted-foreground">
              Projeção: {formatCurrency(projecaoLucro)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pecasRestantes}</div>
            <p className="text-xs text-muted-foreground">
              de {totalPecas} peças
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Produtos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Produtos</CardTitle>
              <CardDescription>
                {remessa.produtos.length} {remessa.produtos.length === 1 ? 'produto' : 'produtos'} cadastrados
              </CardDescription>
            </div>
            <Button onClick={() => setShowModalProduto(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Produto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {remessa.produtos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Nenhum produto cadastrado</p>
              <Button onClick={() => setShowModalProduto(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Produto
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {remessa.produtos.map((produto) => (
                <div
                  key={produto.id}
                  className="flex items-center justify-between border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{produto.nome}</h3>
                    {produto.descricao && (
                      <p className="text-sm text-muted-foreground">{produto.descricao}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-muted-foreground">
                        Estoque: <span className="font-medium text-foreground">
                          {produto.quantidadeEstoque} / {produto.quantidadeInicial}
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        Custo: <span className="font-medium text-foreground">
                          {formatCurrency(produto.precoCusto)}
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        Venda: <span className="font-medium text-foreground">
                          {formatCurrency(produto.precoVenda)}
                        </span>
                      </span>
                      <span className="text-green-600 font-medium">
                        +{formatPercentage(produto.margemLucro)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {remessa.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{remessa.observacoes}</p>
          </CardContent>
        </Card>
      )}

      {/* Modal de Adicionar Produto */}
      {showModalProduto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Adicionar Produto</CardTitle>
              <CardDescription>
                Cadastre um novo produto nesta remessa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitProduto} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome do Produto *</label>
                  <input
                    type="text"
                    value={formProduto.nome}
                    onChange={(e) => setFormProduto({ ...formProduto, nome: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Ex: Vestido Floral"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <textarea
                    value={formProduto.descricao}
                    onChange={(e) => setFormProduto({ ...formProduto, descricao: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    rows={2}
                    placeholder="Detalhes do produto"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Quantidade *</label>
                  <input
                    type="number"
                    min="1"
                    value={formProduto.quantidadeInicial}
                    onChange={(e) => setFormProduto({ ...formProduto, quantidadeInicial: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Preço de Custo (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formProduto.precoCusto}
                    onChange={(e) => setFormProduto({ ...formProduto, precoCusto: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Preço de Venda (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formProduto.precoVenda}
                    onChange={(e) => setFormProduto({ ...formProduto, precoVenda: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="0.00"
                    required
                  />
                </div>

                {formProduto.precoCusto && formProduto.precoVenda && (
                  <div className="rounded-lg bg-primary/10 p-3">
                    <p className="text-sm font-medium">
                      Margem de Lucro:{' '}
                      <span className="text-primary">
                        {formatPercentage(
                          ((parseFloat(formProduto.precoVenda) - parseFloat(formProduto.precoCusto)) /
                            parseFloat(formProduto.precoCusto)) * 100
                        )}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Lucro unitário: {formatCurrency(parseFloat(formProduto.precoVenda) - parseFloat(formProduto.precoCusto))}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Adicionar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModalProduto(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
