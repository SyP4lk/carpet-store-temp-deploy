import { z } from 'zod'

export type CliArgs = {
  dryRun: boolean
  limit?: number
  since?: string
  debug: boolean
}

export type SyncConfig = {
  baseUrl: string
  startUrls: string[]
  maxConcurrency: number
  rateLimitMs: number
  usePlaywright: boolean
  userDataDir: string
  reportDir: string
  dryRun: boolean
  limit?: number
  since?: string
  debug: boolean
}

const ENV_SCHEMA = z.object({
  baseUrl: z.string().url().default('https://www.bmhome.com.tr'),
  maxConcurrency: z.coerce.number().int().min(1).default(4),
  rateLimitMs: z.coerce.number().int().min(0).default(300),
  reportDir: z.string().default('./sync_reports'),
  userDataDir: z.string().default('./.bmhome_profile'),
})

const CLI_SCHEMA = z.object({
  dryRun: z.boolean().default(false),
  limit: z.number().int().positive().optional(),
  since: z.string().datetime().optional(),
  debug: z.boolean().default(false),
})

export function parseCliArgs(argv: string[]): CliArgs {
  const result: CliArgs = {
    dryRun: false,
    debug: false,
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--dry-run') {
      result.dryRun = true
      continue
    }
    if (arg === '--debug') {
      result.debug = true
      continue
    }
    if (arg.startsWith('--limit=')) {
      const value = arg.split('=')[1]
      const parsed = Number.parseInt(value ?? '', 10)
      if (!Number.isFinite(parsed)) {
        throw new Error(`Invalid --limit value: ${value}`)
      }
      result.limit = parsed
      continue
    }
    if (arg === '--limit') {
      const value = argv[i + 1]
      i += 1
      const parsed = Number.parseInt(value ?? '', 10)
      if (!Number.isFinite(parsed)) {
        throw new Error(`Invalid --limit value: ${value}`)
      }
      result.limit = parsed
      continue
    }
    if (arg.startsWith('--since=')) {
      const value = arg.split('=')[1]
      if (!value) {
        throw new Error('Invalid --since value')
      }
      result.since = value
      continue
    }
    if (arg === '--since') {
      const value = argv[i + 1]
      i += 1
      if (!value) {
        throw new Error('Invalid --since value')
      }
      result.since = value
      continue
    }
  }

  const parsed = CLI_SCHEMA.parse(result)
  return parsed
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback
  }
  const normalized = value.trim().toLowerCase()
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) {
    return true
  }
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) {
    return false
  }
  return fallback
}

function parseStartUrls(raw: string | undefined, baseUrl: string): string[] {
  const list = (raw ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)

  const toAbsolute = (entry: string) => {
    try {
      return new URL(entry, baseUrl).toString()
    } catch {
      return null
    }
  }

  const absolute = list
    .map(toAbsolute)
    .filter((entry): entry is string => Boolean(entry))

  if (absolute.length > 0) {
    return absolute
  }

  const fallbackPaths = ['/tum-halilar', '/yeni-halilar', '/yolluklar']
  return fallbackPaths.map((path) => new URL(path, baseUrl).toString())
}

export function loadConfig(argv: string[]): SyncConfig {
  const cli = parseCliArgs(argv)
  const envParsed = ENV_SCHEMA.parse({
    baseUrl: process.env.BMHOME_BASE_URL,
    maxConcurrency: process.env.BMHOME_MAX_CONCURRENCY,
    rateLimitMs: process.env.BMHOME_RATE_LIMIT_MS,
    reportDir: process.env.SYNC_REPORT_DIR,
    userDataDir: process.env.BMHOME_USER_DATA_DIR,
  })

  const usePlaywright = parseBoolean(process.env.BMHOME_USE_PLAYWRIGHT, true)
  const startUrls = parseStartUrls(process.env.BMHOME_START_URLS, envParsed.baseUrl)

  return {
    baseUrl: envParsed.baseUrl,
    startUrls,
    maxConcurrency: envParsed.maxConcurrency,
    rateLimitMs: envParsed.rateLimitMs,
    usePlaywright,
    userDataDir: envParsed.userDataDir,
    reportDir: envParsed.reportDir,
    dryRun: cli.dryRun,
    limit: cli.limit,
    since: cli.since,
    debug: cli.debug,
  }
}
