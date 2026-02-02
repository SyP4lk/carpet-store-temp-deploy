import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import path from 'node:path'
import fs from 'node:fs/promises'

export const runtime = 'nodejs'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return null
  }
  return session
}

function resolveSafePath(baseDir: string, targetPath: string): string | null {
  const resolvedBase = path.resolve(baseDir)
  const resolvedTarget = path.resolve(targetPath)
  const relative = path.relative(resolvedBase, resolvedTarget)
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return null
  }
  return resolvedTarget
}

export async function GET(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const runId = Number(url.searchParams.get('runId'))
  const type = (url.searchParams.get('type') || 'md').toLowerCase()

  if (!Number.isFinite(runId)) {
    return NextResponse.json({ error: 'Invalid runId' }, { status: 400 })
  }

  const run = await prisma.bmhomeSyncRun.findUnique({
    where: { id: runId },
  })

  if (!run?.reportDir) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  const baseDir = path.resolve(process.cwd(), process.env.SYNC_REPORT_DIR || 'sync_reports')
  let targetPath: string | null = null

  if (type === 'md') {
    if (!run.reportMdPath) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }
    targetPath = resolveSafePath(baseDir, run.reportMdPath)
  } else if (type === 'json') {
    if (!run.reportJsonPath) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }
    targetPath = resolveSafePath(baseDir, run.reportJsonPath)
  } else if (type === 'log') {
    const logPath = path.join(run.reportDir, 'run.log')
    targetPath = resolveSafePath(baseDir, logPath)
  } else {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  if (!targetPath) {
    return NextResponse.json({ error: 'Invalid report path' }, { status: 400 })
  }

  try {
    const content = await fs.readFile(targetPath, type === 'json' ? 'utf8' : 'utf8')
    if (type === 'json') {
      return NextResponse.json(JSON.parse(content))
    }
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read report' }, { status: 500 })
  }
}
