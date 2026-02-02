import { prisma } from './prisma'
import { CatalogMode, Prisma, ProductSource } from '@prisma/client'

export type CatalogSource = 'DEFAULT' | 'BMHOME' | 'MERGE'

export type CatalogResolution = {
  settings: {
    catalogMode: CatalogMode
    autoFallbackMinCount: number
    feedUrl: string
    usdToEurRate: number
  }
  bmhomeCount: number
  resolvedSource: CatalogSource
  where?: Prisma.ProductWhereInput
}

export async function getBmhomeSyncSettings() {
  const defaultFeedUrl =
    process.env.BMHOME_FEED_URL ||
    'https://www.bmhome.com.tr/TicimaxXmlV2/7253FC19C30949458CFEA4A870C7779E/'
  const defaultUsdToEurRate = Number(process.env.BMHOME_USD_TO_EUR_RATE || '1')

  const existing = await prisma.bmhomeSyncSettings.findUnique({
    where: { id: 1 },
  })

  if (existing) {
    if (!existing.feedUrl || existing.feedUrl.trim().length === 0) {
      return prisma.bmhomeSyncSettings.update({
        where: { id: 1 },
        data: {
          feedUrl: defaultFeedUrl,
        },
      })
    }

    if (!existing.usdToEurRate || existing.usdToEurRate <= 0) {
      return prisma.bmhomeSyncSettings.update({
        where: { id: 1 },
        data: { usdToEurRate: Number.isFinite(defaultUsdToEurRate) ? defaultUsdToEurRate : 1 },
      })
    }

    return existing
  }

  try {
    return await prisma.bmhomeSyncSettings.create({
      data: {
        id: 1,
        feedUrl: defaultFeedUrl,
        usdToEurRate: Number.isFinite(defaultUsdToEurRate) ? defaultUsdToEurRate : 1,
      },
    })
  } catch {
    const fallback = await prisma.bmhomeSyncSettings.findUnique({
      where: { id: 1 },
    })
    if (!fallback) {
      throw new Error('Failed to initialize BMHOME sync settings')
    }
    return fallback
  }
}


export async function resolveCatalogSource(): Promise<CatalogResolution> {
  const settings = await getBmhomeSyncSettings()
  const bmhomeCount = await prisma.product.count({
    where: {
      source: ProductSource.BMHOME,
      price: { not: '' },
    },
  })

  let resolvedSource: CatalogSource = 'MERGE'
  let where: Prisma.ProductWhereInput | undefined

  switch (settings.catalogMode) {
    case CatalogMode.DEFAULT_ONLY:
      resolvedSource = 'DEFAULT'
      where = { source: ProductSource.DEFAULT }
      break
    case CatalogMode.BMHOME_ONLY:
      resolvedSource = 'BMHOME'
      where = { source: ProductSource.BMHOME }
      break
    case CatalogMode.AUTO: {
      const useBmhome = bmhomeCount >= settings.autoFallbackMinCount
      resolvedSource = useBmhome ? 'BMHOME' : 'DEFAULT'
      where = { source: useBmhome ? ProductSource.BMHOME : ProductSource.DEFAULT }
      break
    }
    case CatalogMode.MERGE:
    default:
      resolvedSource = 'MERGE'
      where = undefined
  }

  return {
    settings: {
      catalogMode: settings.catalogMode,
      autoFallbackMinCount: settings.autoFallbackMinCount,
      feedUrl: settings.feedUrl,
      usdToEurRate: settings.usdToEurRate,
    },
    bmhomeCount,
    resolvedSource,
    where,
  }
}
