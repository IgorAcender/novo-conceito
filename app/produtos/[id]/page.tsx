'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'

interface Produto {
  id: string
  nome: string
  descricao: string | null
  quantidadeInicial: number
  quantidadeEstoque: number
  precoCusto: number
  precoVenda: number
  taxaCartao: number
  embalagem: number
  outrosCustos: number
  custoTotal: number
  margemLucro: number
  fotos: string
  createdAt: string
  remessa: {
    id: string
    fornecedor: string | null
    dataCompra: string
  }
}

export default function EditarProdutoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [produto, setProduto] = useState<Produto | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    quantidadeEstoque: 0,
    precoCusto: 0,
    precoVenda: 0,
    taxaCartao: 0,
    embalagem: 0,
    outrosCustos: 0
  })

  useEffect(() => {
    fetchProduto()
  }, [params.id])

  async function fetchProduto() {
    try {
      const response = await fetch(`/api/produtos/${params.id}`)
      if (!response.ok) throw new Error('Produto não encontrado')
      
      const data = await response.json()
      setProduto(data)
      setFormData({
        nome: data.nome,
        descricao: data.descricao || '',
        quantidadeEstoque: data.quantidadeEstoque,
        precoCusto: data.precoCusto,
        precoVenda: data.precoVenda,
        taxaCartao: data.taxaCartao || 0,
        embalagem: data.embalagem || 0,
        outrosCustos: data.outrosCustos || 0
      })
    } catch (error) {
      console.error('Erro ao carregar produto:', error)
      router.push('/produtos')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const response = await fetch(`/api/produtos/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Erro ao salvar produto')
      
      router.push('/produtos')
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      alert('Erro ao salvar produto. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      const response = await fetch(`/api/produtos/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Erro ao excluir produto')
      
      router.push('/produtos')
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      alert('Erro ao excluir produto. Tente novamente.')
    }
  }

  // Calcular valores em tempo real
  const custoTotal = formData.precoCusto + formData.taxaCartao + formData.embalagem + formData.outrosCustos
  const margemLucro = custoTotal > 0 ? ((formData.precoVenda - custoTotal) / custoTotal) * 100 : 0
  const lucroUnitario = formData.precoVenda - custoTotal

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Carregando produto...</p>
      </div>
    )
  }

  if (!produto) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Produto não encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Produto</h1>
            <p className="text-muted-foreground">
              Remessa: {produto.remessa.fornecedor || 'Sem fornecedor'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>Dados principais do produto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Produto</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Digite o nome do produto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição opcional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estoque">Quantidade em Estoque</Label>
              <Input
                id="estoque"
                type="number"
                value={formData.quantidadeEstoque}
                onChange={(e) => setFormData({ ...formData, quantidadeEstoque: parseInt(e.target.value) || 0 })}
                min="0"
                max={produto.quantidadeInicial}
              />
              <p className="text-xs text-muted-foreground">
                Máximo: {produto.quantidadeInicial} (quantidade inicial)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Custos e Preços */}
        <Card>
          <CardHeader>
            <CardTitle>Custos e Preços</CardTitle>
            <CardDescription>Definição de custos e preços de venda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="precoCusto">Preço de Custo</Label>
              <Input
                id="precoCusto"
                type="number"
                step="0.01"
                value={formData.precoCusto}
                onChange={(e) => setFormData({ ...formData, precoCusto: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxaCartao">Taxa do Cartão</Label>
              <Input
                id="taxaCartao"
                type="number"
                step="0.01"
                value={formData.taxaCartao}
                onChange={(e) => setFormData({ ...formData, taxaCartao: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="embalagem">Embalagem/Sacola</Label>
              <Input
                id="embalagem"
                type="number"
                step="0.01"
                value={formData.embalagem}
                onChange={(e) => setFormData({ ...formData, embalagem: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outrosCustos">Outros Custos</Label>
              <Input
                id="outrosCustos"
                type="number"
                step="0.01"
                value={formData.outrosCustos}
                onChange={(e) => setFormData({ ...formData, outrosCustos: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precoVenda">Preço de Venda</Label>
              <Input
                id="precoVenda"
                type="number"
                step="0.01"
                value={formData.precoVenda}
                onChange={(e) => setFormData({ ...formData, precoVenda: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
          </CardContent>
        </Card>

        {/* Resumo Financeiro */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
            <CardDescription>Cálculos automáticos baseados nos valores informados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold">{formatCurrency(custoTotal)}</p>
                <p className="text-xs text-muted-foreground">
                  Custo + Taxas + Outros
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Lucro Unitário</p>
                <p className={`text-2xl font-bold ${lucroUnitario >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(lucroUnitario)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Venda - Custo Total
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Margem de Lucro</p>
                <p className={`text-2xl font-bold ${margemLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {margemLucro.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Percentual de lucro
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Vendidos</p>
                <p className="text-2xl font-bold">
                  {produto.quantidadeInicial - produto.quantidadeEstoque}
                </p>
                <p className="text-xs text-muted-foreground">
                  de {produto.quantidadeInicial} peças
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}