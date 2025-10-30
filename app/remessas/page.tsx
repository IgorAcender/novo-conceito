'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, formatPercentage } from '@/lib/utils'
import { Plus, Eye, TrendingUp, Package, DollarSign } from 'lucide-react'

interface Remessa {
  id: string
  dataCompra: string
  custoViagem: number
  fornecedor: string | null
  status: string
  produtos: any[]
  estatisticas: {
    totalInvestido: number
    totalVendido: number
    lucroRealizado: number
    projecaoLucro: number
    pecasRestantes: number
    totalPecas: number
    percentualVendido: number
  }
}

export default function RemessasPage() {
  const [remessas, setRemessas] = useState<Remessa[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    dataCompra: new Date().toISOString().split('T')[0],
    custoViagem: '',
    fornecedor: '',
    observacoes: '',
  })

  useEffect(() => {
    fetchRemessas()
  }, [])

  async function fetchRemessas() {
    try {
      const response = await fetch('/api/remessas')
      const data = await response.json()
      setRemessas(data)
    } catch (error) {
      console.error('Erro ao carregar remessas:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch('/api/remessas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowModal(false)
        setFormData({
          dataCompra: new Date().toISOString().split('T')[0],
          custoViagem: '',
          fornecedor: '',
          observacoes: '',
        })
        fetchRemessas()
      }
    } catch (error) {
      console.error('Erro ao criar remessa:', error)
    }
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Remessas</h1>
          <p className="text-muted-foreground">
            Gerencie suas remessas de produtos
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Remessa
        </Button>
      </div>

      {remessas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhuma remessa cadastrada</p>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Remessa
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {remessas.map((remessa) => (
            <Card key={remessa.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {remessa.fornecedor || 'Sem fornecedor'}
                  </CardTitle>
                  <Badge variant={remessa.status === 'ativa' ? 'default' : 'secondary'}>
                    {remessa.status}
                  </Badge>
                </div>
                <CardDescription>
                  {formatDate(remessa.dataCompra)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Investimento
                    </span>
                    <span className="font-medium">
                      {formatCurrency(remessa.estatisticas.totalInvestido)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Lucro Realizado
                    </span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(remessa.estatisticas.lucroRealizado)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      Peças
                    </span>
                    <span className="font-medium">
                      {remessa.estatisticas.pecasRestantes} / {remessa.estatisticas.totalPecas}
                    </span>
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Vendido</span>
                    <span className="font-medium">
                      {formatPercentage(remessa.estatisticas.percentualVendido)}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${remessa.estatisticas.percentualVendido}%` }}
                    />
                  </div>
                </div>

                <Link href={`/remessas/${remessa.id}`}>
                  <Button variant="outline" className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalhes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Nova Remessa */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Nova Remessa</CardTitle>
              <CardDescription>
                Cadastre uma nova remessa de produtos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Data da Compra</label>
                  <input
                    type="date"
                    value={formData.dataCompra}
                    onChange={(e) => setFormData({ ...formData, dataCompra: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Custo da Viagem (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.custoViagem}
                    onChange={(e) => setFormData({ ...formData, custoViagem: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Fornecedor</label>
                  <input
                    type="text"
                    value={formData.fornecedor}
                    onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Nome do fornecedor"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Observações</label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Observações adicionais"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Criar Remessa
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
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
