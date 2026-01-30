import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { spawn } from 'node:child_process'
import { BmhomeSyncStatus } from '@prisma/client'

export const runtime = 'nodejs'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return null
  }
  return session
}

export async function POST() {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const running = await prisma.bmhomeSyncRun.findFirst({
    where: { status: BmhomeSyncStatus.RUNNING },
    orderBy: { startedAt: 'desc' },
  })

  if (running) {
    return NextResponse.json(
      { error: 'Sync already running', runId: running.id },
      { status: 409 }
    )
  }

  const run = await prisma.bmhomeSyncRun.create({
    data: {
      status: BmhomeSyncStatus.RUNNING,
      summaryRu: 'Синхронизация запущена из админки.',
    },
  })

  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  const child = spawn(command, ['run', 'sync:bmhome'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      BMHOME_RUN_ID: String(run.id),
    },
    detached: true,
    stdio: 'ignore',
  })

  child.unref()

  return NextResponse.json({ ok: true, runId: run.id })
}
