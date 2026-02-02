import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { fetchEURtoRUBRate } from '@/lib/currency'
import { resolveCatalogSource } from '@/lib/bmhomeSync'
import { BmhomeSyncStatus, CatalogMode } from '@prisma/client'

export const runtime = 'nodejs'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return null
  }
  return session
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resolution = await resolveCatalogSource()
  const lastRun = await prisma.bmhomeSyncRun.findFirst({
    orderBy: { startedAt: 'desc' },
  })
  const eurToRubRate = await fetchEURtoRUBRate()

  let warningRu: string | null = null
  if (
    resolution.settings.catalogMode === CatalogMode.AUTO &&
    resolution.bmhomeCount < resolution.settings.autoFallbackMinCount
  ) {
    if (lastRun?.status === BmhomeSyncStatus.FAILED) {
      warningRu =
        'Синхронизация не смогла получить товары, сайт показывает дефолтный каталог. Проверьте доступ к XML фиду и журнал запуска.'
    }
  }

  if (resolution.settings.catalogMode === CatalogMode.BMHOME_ONLY && resolution.bmhomeCount < 1) {
    warningRu = 'Товаров BMHOME пока нет. В режиме "Только BMHOME" каталог будет пустым.'
  }

  return NextResponse.json({
    settings: resolution.settings,
    bmhomeCount: resolution.bmhomeCount,
    resolvedSource: resolution.resolvedSource,
    lastRun,
    eurToRubRate,
    warningRu,
  })
}

const settingsSchema = z.object({
  catalogMode: z.nativeEnum(CatalogMode),
  autoFallbackMinCount: z.number().int().min(1),
  feedUrl: z.string().url(),
  usdToEurRate: z.number().positive(),
})

export async function PUT(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validated = settingsSchema.parse(body)

    const updated = await prisma.bmhomeSyncSettings.upsert({
      where: { id: 1 },
      update: {
        catalogMode: validated.catalogMode,
        autoFallbackMinCount: validated.autoFallbackMinCount,
        feedUrl: validated.feedUrl,
        usdToEurRate: validated.usdToEurRate,
      },
      create: {
        id: 1,
        catalogMode: validated.catalogMode,
        autoFallbackMinCount: validated.autoFallbackMinCount,
        feedUrl: validated.feedUrl,
        usdToEurRate: validated.usdToEurRate,
      },
    })

    return NextResponse.json({ settings: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
