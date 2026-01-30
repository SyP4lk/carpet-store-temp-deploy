import { prisma } from './prisma'
import { CatalogMode, Prisma, ProductSource } from '@prisma/client'

export type CatalogSource = 'DEFAULT' | 'BMHOME' | 'MERGE'

export type CatalogResolution = {
  settings: {
    catalogMode: CatalogMode
    autoFallbackMinCount: number
  }
  bmhomeCount: number
  resolvedSource: CatalogSource
  where?: Prisma.ProductWhereInput
}

export async function getBmhomeSyncSettings() {
  const existing = await prisma.bmhomeSyncSettings.findUnique({
    where: { id: 1 },
  })
  if (existing) {
    return existing
  }
  try {
    return await prisma.bmhomeSyncSettings.create({
      data: {
        id: 1,
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
    },
    bmhomeCount,
    resolvedSource,
    where,
  }
}
