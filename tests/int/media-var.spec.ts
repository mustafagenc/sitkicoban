// @vitest-environment node
import { mkdtempSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { head } = vi.hoisted(() => ({ head: vi.fn() }))
vi.mock('@vercel/blob', () => {
  class BlobNotFoundError extends Error {}
  return { head, BlobNotFoundError }
})

import { BlobNotFoundError } from '@vercel/blob'
import { mediaDosyasiVar } from '@/seed/media-var'

const dir = mkdtempSync(path.join(os.tmpdir(), 'media-var-'))
writeFileSync(path.join(dir, 'var.jpg'), 'x')

describe('mediaDosyasiVar', () => {
  beforeEach(() => head.mockReset())
  afterEach(() => {
    delete process.env.BLOB_READ_WRITE_TOKEN
  })

  it('without a Blob token checks the local media folder', async () => {
    expect(await mediaDosyasiVar({ filename: 'var.jpg' }, dir)).toBe(true)
    expect(await mediaDosyasiVar({ filename: 'yok.jpg' }, dir)).toBe(false)
    expect(head).not.toHaveBeenCalled()
  })

  it('with a Blob token asks Blob, whatever the stored url says', async () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_abc_def'
    head.mockResolvedValueOnce({ pathname: 'yok.jpg' })
    expect(await mediaDosyasiVar({ filename: 'yok.jpg' }, dir)).toBe(true)
    expect(head).toHaveBeenCalledWith('yok.jpg', { token: 'vercel_blob_rw_abc_def' })

    head.mockRejectedValueOnce(new BlobNotFoundError())
    expect(await mediaDosyasiVar({ filename: 'var.jpg', prefix: 'a/b' }, dir)).toBe(false)
    expect(head).toHaveBeenLastCalledWith('a/b/var.jpg', { token: 'vercel_blob_rw_abc_def' })
  })

  it('rethrows other Blob errors instead of re-uploading', async () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_abc_def'
    head.mockRejectedValueOnce(new Error('ağ hatası'))
    await expect(mediaDosyasiVar({ filename: 'var.jpg' }, dir)).rejects.toThrow('ağ hatası')
  })
})
