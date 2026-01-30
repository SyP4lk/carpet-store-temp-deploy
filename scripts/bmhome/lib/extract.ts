import type { CheerioAPI } from 'cheerio'

type JsonLdProduct = {
  sku?: string
  mpn?: string
  productID?: string
  image?: string | string[]
  offers?: {
    price?: string | number
    availability?: string
    priceSpecification?: { price?: string | number }
  }
}

function cleanText(value: string | undefined | null): string | null {
  const text = (value ?? '').replace(/\s+/g, ' ').trim()
  return text.length > 0 ? text : null
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values))
}

function parseJsonLdProducts($: CheerioAPI): JsonLdProduct[] {
  const products: JsonLdProduct[] = []
  $('script[type="application/ld+json"]').each((_, element) => {
    const raw = $(element).text()
    if (!raw) {
      return
    }
    try {
      const parsed = JSON.parse(raw)
      const candidates = Array.isArray(parsed) ? parsed : [parsed]
      for (const entry of candidates) {
        if (!entry || typeof entry !== 'object') {
          continue
        }
        if (entry['@type'] === 'Product') {
          products.push(entry as JsonLdProduct)
        }
        if (Array.isArray(entry['@graph'])) {
          for (const graphEntry of entry['@graph']) {
            if (graphEntry && graphEntry['@type'] === 'Product') {
              products.push(graphEntry as JsonLdProduct)
            }
          }
        }
      }
    } catch {
      // ignore invalid JSON-LD
    }
  })
  return products
}

export function extractProductLinks($: CheerioAPI): string[] {
  const selectors = [
    '.product a[href]',
    '.product-item a[href]',
    '.product-card a[href]',
    'a.product-link[href]',
    'a[href*="/product"]',
    'a[href*="/urun"]',
    'a[href*="/p/"]',
  ]
  const links: string[] = []

  for (const selector of selectors) {
    $(selector).each((_, element) => {
      const href = $(element).attr('href')
      if (!href) {
        return
      }
      if (href.startsWith('javascript:') || href.startsWith('#')) {
        return
      }
      links.push(href)
    })
  }

  $('[data-product-url]').each((_, element) => {
    const href = $(element).attr('data-product-url')
    if (href) {
      links.push(href)
    }
  })

  return unique(links)
}

export function extractProductCode($: CheerioAPI, url: string): string | null {
  const jsonLd = parseJsonLdProducts($)
  for (const product of jsonLd) {
    const value = cleanText(product.sku ?? product.mpn ?? product.productID)
    if (value) {
      return value
    }
  }

  const metaSelectors = [
    'meta[property="product:retailer_item_id"]',
    'meta[property="product:sku"]',
    'meta[name="sku"]',
    'meta[itemprop="sku"]',
  ]
  for (const selector of metaSelectors) {
    const content = $(selector).attr('content')
    const value = cleanText(content)
    if (value) {
      return value
    }
  }

  const selectors = [
    '[itemprop="sku"]',
    '.sku',
    '.product-sku',
    '.product-code',
    '[data-product-code]',
  ]
  for (const selector of selectors) {
    const element = $(selector).first()
    const dataValue = element.attr('data-product-code')
    const text = cleanText(dataValue ?? element.text())
    if (text) {
      return text
    }
  }

  try {
    const parsed = new URL(url)
    const paramSku = parsed.searchParams.get('sku') ?? parsed.searchParams.get('productCode')
    const fromParam = cleanText(paramSku ?? undefined)
    if (fromParam) {
      return fromParam
    }
    const parts = parsed.pathname.split('/').filter(Boolean)
    const last = parts[parts.length - 1]
    if (last && last.length >= 4 && /\d/.test(last)) {
      return last
    }
  } catch {
    // ignore
  }

  return null
}

export function extractPrice($: CheerioAPI): string | null {
  const jsonLd = parseJsonLdProducts($)
  for (const product of jsonLd) {
    const offer = product.offers
    const priceValue = offer?.price ?? offer?.priceSpecification?.price
    if (priceValue !== undefined && priceValue !== null) {
      return String(priceValue)
    }
  }

  const metaSelectors = [
    'meta[property="product:price:amount"]',
    'meta[itemprop="price"]',
  ]
  for (const selector of metaSelectors) {
    const content = $(selector).attr('content')
    const value = cleanText(content)
    if (value) {
      return value
    }
  }

  const selectors = [
    '[itemprop="price"]',
    '.price',
    '.product-price',
    '.current-price',
    '.price--current',
    'span.price',
  ]
  for (const selector of selectors) {
    const text = cleanText($(selector).first().text())
    if (text) {
      return text
    }
  }

  return null
}

export function extractImages($: CheerioAPI): string[] {
  const images: string[] = []

  const jsonLd = parseJsonLdProducts($)
  for (const product of jsonLd) {
    const image = product.image
    if (Array.isArray(image)) {
      images.push(...image)
    } else if (image) {
      images.push(image)
    }
  }

  $('meta[property="og:image"], meta[property="og:image:secure_url"]').each((_, element) => {
    const content = $(element).attr('content')
    if (content) {
      images.push(content)
    }
  })

  const selectors = [
    '.product-gallery img',
    '.product-images img',
    'img[data-zoom-image]',
    'img[data-src]',
    'img[src]',
  ]
  for (const selector of selectors) {
    $(selector).each((_, element) => {
      const dataZoom = $(element).attr('data-zoom-image')
      const dataSrc = $(element).attr('data-src')
      const src = $(element).attr('src')
      const candidate = dataZoom ?? dataSrc ?? src
      if (!candidate) {
        return
      }
      if (candidate.startsWith('data:')) {
        return
      }
      images.push(candidate)
    })
  }

  return unique(
    images
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
  )
}

export function extractSizes($: CheerioAPI): string[] {
  const sizes: string[] = []

  const selectors = [
    'select[name*="size"] option',
    'select[id*="size"] option',
    'select[name*="olcu"] option',
    'select[id*="olcu"] option',
    '.size option',
    '.sizes option',
    '.size-list li',
    '.sizes li',
    '[data-size]',
  ]
  for (const selector of selectors) {
    $(selector).each((_, element) => {
      const dataSize = $(element).attr('data-size')
      const text = cleanText(dataSize ?? $(element).text())
      if (!text) {
        return
      }
      const normalized = text
        .replace(/\s+/g, ' ')
        .replace(/^(select|choose)\s+/i, '')
      if (normalized.length > 0) {
        sizes.push(normalized)
      }
    })
  }

  return unique(sizes)
}

export function extractInStock($: CheerioAPI): boolean | null {
  const jsonLd = parseJsonLdProducts($)
  for (const product of jsonLd) {
    const availability = product.offers?.availability
    if (availability) {
      if (availability.toLowerCase().includes('instock')) {
        return true
      }
      if (availability.toLowerCase().includes('outofstock')) {
        return false
      }
    }
  }

  const metaAvailability = $('meta[property="product:availability"]').attr('content')
  if (metaAvailability) {
    const normalized = metaAvailability.toLowerCase()
    if (normalized.includes('instock')) {
      return true
    }
    if (normalized.includes('outofstock')) {
      return false
    }
  }

  const bodyText = $('body').text().toLowerCase()
  if (bodyText.includes('out of stock') || bodyText.includes('stokta yok') || bodyText.includes('tukendi')) {
    return false
  }

  const addToCart = $('button[type="submit"], button.add-to-cart, button[name="add"]').first()
  if (addToCart.length > 0) {
    const disabled = addToCart.is('[disabled]') || addToCart.attr('aria-disabled') === 'true'
    return !disabled
  }

  return null
}

export function extractIsNew($: CheerioAPI, fromListingContext: boolean): boolean {
  if (fromListingContext) {
    return true
  }

  const badgeText = $('.badge, .product-badge, .tag, .label')
    .text()
    .toLowerCase()
  if (badgeText.includes('new') || badgeText.includes('yeni')) {
    return true
  }

  return false
}

export function extractIsRunners($: CheerioAPI, fromListingContext: boolean): boolean {
  if (fromListingContext) {
    return true
  }

  const breadcrumb = $('.breadcrumb, .breadcrumbs, nav[aria-label="breadcrumb"]')
    .text()
    .toLowerCase()
  if (breadcrumb.includes('runner') || breadcrumb.includes('yolluk')) {
    return true
  }

  const bodyText = $('body').text().toLowerCase()
  if (bodyText.includes('runner') || bodyText.includes('yolluk')) {
    return true
  }

  return false
}
