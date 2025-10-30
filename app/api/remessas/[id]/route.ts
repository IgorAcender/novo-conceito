import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Buscar remessa por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const remessa = await prisma.remessa.findUnique({
      where: { id: params.id },
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

    if (!remessa) {
      return NextResponse.json(
        { error: 'Remessa não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(remessa)
  } catch (error) {
    console.error('Erro ao buscar remessa:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar remessa' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar remessa
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const remessa = await prisma.remessa.update({
      where: { id: params.id },
      data: {
        ...(body.dataCompra && { dataCompra: new Date(body.dataCompra) }),
        ...(body.custoViagem !== undefined && { custoViagem: parseFloat(body.custoViagem) }),
        ...(body.fornecedor !== undefined && { fornecedor: body.fornecedor }),
        ...(body.observacoes !== undefined && { observacoes: body.observacoes }),
        ...(body.status && { status: body.status }),
      },
    })

    return NextResponse.json(remessa)
  } catch (error) {
    console.error('Erro ao atualizar remessa:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar remessa' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar remessa
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.remessa.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar remessa:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar remessa' },
      { status: 500 }
    )
  }
}
