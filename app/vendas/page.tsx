'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, ShoppingCart, X } from 'lucide-react'

interface Produto {
  id: string
  nome: string
  quantidadeEstoque: number
  precoVenda: number
  precoCusto: number
  remessa: {
    fornecedor: string | null
  }
}

interface Venda {
  id: string
  dataVenda: string
  valorTotal: number
  lucroTotal: number
  observacoes: string | null
  produtos: Array<{
    quantidade: number
    precoUnitario: number
    subtotal: number
    produto: {
      nome: string
    }
  }>
}

interface ItemVenda {
  produtoId: string
  nome: string
  quantidade: number
  precoUnitario: number
  precoCusto: number
}

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [itensVenda, setItensVenda] = useState<ItemVenda[]>([])
  const [produtoSelecionado, setProdutoSelecionado] = useState<string>('')
  const [quantidade, setQuantidade] = useState<number>(1)
  const [dataVenda, setDataVenda] = useState(new Date().toISOString().split('T')[0])
  const [observacoes, setObservacoes] = useState('')

  useEffect(() => {
    fetchVendas()
    fetchProdutos()
  }, [])

  async function fetchVendas() {
    try {
      const response = await fetch('/api/vendas')
      const data = await response.json()
      setVendas(data)
    } catch (error) {
      console.error('Erro ao carregar vendas:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchProdutos() {
    try {
      const response = await fetch('/api/produtos')
      const data = await response.json()
      // Filtrar apenas produtos com estoque
      setProdutos(data.filter((p: Produto) => p.quantidadeEstoque > 0))
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
  }

  function adicionarItem() {
    const produto = produtos.find(p => p.id === produtoSelecionado)
    if (!produto) return

    if (quantidade > produto.quantidadeEstoque) {
      alert('Quantidade maior que o estoque disponível')
      return
    }

    const itemExistente = itensVenda.find(i => i.produtoId === produtoSelecionado)
    if (itemExistente) {
      alert('Produto já adicionado. Remova-o primeiro para alterar a quantidade.')
      return
    }

    setItensVenda([...itensVenda, {
      produtoId: produto.id,
      nome: produto.nome,
      quantidade,
      precoUnitario: produto.precoVenda,
      precoCusto: produto.precoCusto,
    }])

    setProdutoSelecionado('')
    setQuantidade(1)
  }

  function removerItem(produtoId: string) {
    setItensVenda(itensVenda.filter(i => i.produtoId !== produtoId))
  }

  async function finalizarVenda() {
    if (itensVenda.length === 0) {
      alert('Adicione pelo menos um produto')
      return
    }

    try {
      const response = await fetch('/api/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataVenda,
          observacoes,
          produtos: itensVenda.map(item => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
            precoCusto: item.precoCusto,
          })),
        }),
      })

      if (response.ok) {
        setShowModal(false)
        setItensVenda([])
        setDataVenda(new Date().toISOString().split('T')[0])
        setObservacoes('')
        fetchVendas()
        fetchProdutos()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao registrar venda')
      }
    } catch (error) {
      console.error('Erro ao finalizar venda:', error)
      alert('Erro ao registrar venda')
    }
  }

  const totalVenda = itensVenda.reduce((sum, item) => sum + (item.quantidade * item.precoUnitario), 0)
  const lucroVenda = itensVenda.reduce((sum, item) => sum + (item.quantidade * (item.precoUnitario - item.precoCusto)), 0)

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendas</h1>
          <p className="text-muted-foreground">
            Registre e acompanhe suas vendas
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Venda
        </Button>
      </div>

      {vendas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhuma venda registrada</p>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Primeira Venda
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {vendas.map((venda) => (
            <Card key={venda.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{formatDate(venda.dataVenda)}</CardTitle>
                    <CardDescription>
                      {venda.produtos.length} {venda.produtos.length === 1 ? 'item' : 'itens'}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatCurrency(venda.valorTotal)}</p>
                    <p className="text-sm text-green-600 font-medium">
                      Lucro: {formatCurrency(venda.lucroTotal)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {venda.produtos.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm border-t pt-2">
                      <div>
                        <p className="font-medium">{item.produto.nome}</p>
                        <p className="text-muted-foreground">
                          {item.quantidade}x {formatCurrency(item.precoUnitario)}
                        </p>
                      </div>
                      <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
                {venda.observacoes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">{venda.observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Nova Venda */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Nova Venda</CardTitle>
              <CardDescription>
                Selecione os produtos vendidos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium">Data da Venda</label>
                <input
                  type="date"
                  value={dataVenda}
                  onChange={(e) => setDataVenda(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-medium">Adicionar Produto</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Produto</label>
                    <select
                      value={produtoSelecionado}
                      onChange={(e) => setProdutoSelecionado(e.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Selecione um produto</option>
                      {produtos.map((produto) => (
                        <option key={produto.id} value={produto.id}>
                          {produto.nome} - Estoque: {produto.quantidadeEstoque} - {formatCurrency(produto.precoVenda)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Quantidade</label>
                    <input
                      type="number"
                      min="1"
                      value={quantidade}
                      onChange={(e) => setQuantidade(parseInt(e.target.value))}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <Button
                  onClick={adicionarItem}
                  disabled={!produtoSelecionado}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>

              {itensVenda.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-4">Itens da Venda</h3>
                  <div className="space-y-2">
                    {itensVenda.map((item) => (
                      <div key={item.produtoId} className="flex items-center justify-between p-2 bg-accent/50 rounded">
                        <div className="flex-1">
                          <p className="font-medium">{item.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantidade}x {formatCurrency(item.precoUnitario)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-medium">
                            {formatCurrency(item.quantidade * item.precoUnitario)}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removerItem(item.produtoId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatCurrency(totalVenda)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Lucro</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(lucroVenda)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Observações</label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Observações sobre a venda"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={finalizarVenda}
                  disabled={itensVenda.length === 0}
                  className="flex-1"
                >
                  Finalizar Venda
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false)
                    setItensVenda([])
                    setDataVenda(new Date().toISOString().split('T')[0])
                    setObservacoes('')
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
