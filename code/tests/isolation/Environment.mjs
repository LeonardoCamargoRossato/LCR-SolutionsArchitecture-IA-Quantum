import assert from 'node:assert/strict'
import { networkInterfaces } from 'node:os'
import { appendFileSync, readlinkSync } from 'node:fs'

export const FIXTURE_URL = 'http://127.0.0.1:54321'
export const FIXTURE_KEY = 'lcr-fixture-public-key-not-a-secret'

export function assertIsolated() {
  assert.equal(process.env.LCR_TEST_MODE, '1', 'Use npm run test:isolated -- node tests/<script>.mjs')
  assert.equal(process.env.LCR_ISOLATED_NETNS, '1', 'Missing isolated network namespace')
  assert.equal(process.env.VITE_SUPABASE_URL, FIXTURE_URL, 'Real backend is prohibited in tests')
  assert.equal(process.env.VITE_SUPABASE_PUBLISHABLE_KEY, FIXTURE_KEY, 'Only fixture key allowed')
  assert.equal(process.env.VITE_SUPABASE_MEDIA_BUCKET, 'portfolio-media')
  assert.deepEqual(Object.keys(networkInterfaces()).sort(), ['lo'], 'Non-loopback interface in test namespace')
  assert.equal(readlinkSync('/proc/self/ns/net'), process.env.LCR_NETNS_ID, 'Wrong network namespace')
  for (const key of ['GALLERY_SMOKE_BASE_URL','PORTFOLIO_TEST_BASE_URL','CE235_SMOKE_BASE_URL','INSTITUTION_LOGO_TEST_URL','CITIES_SMOKE_URL']) {
    assert(!process.env[key], 'Published smoke URL forbidden: ' + key)
  }
  assert(!process.env.SUPABASE_SERVICE_ROLE_KEY, 'Privileged key forbidden')
}

export function isAllowed(value) {
  try {
    const u = new URL(String(value))
    return ['data:', 'blob:', 'about:'].includes(u.protocol) ||
      (['http:', 'https:', 'ws:', 'wss:'].includes(u.protocol) && ['127.0.0.1','localhost','[::1]'].includes(u.hostname) && !u.username && !u.password)
  } catch { return false }
}

export function blocked(value, transport) {
  let origin = 'invalid-url'
  let expected = false
  try {
    const u = new URL(String(value))
    origin = u.origin
    expected = process.env.LCR_GUARD_SELF_TEST === '1' && u.hostname === 'lcr-egress-probe.invalid'
  } catch {}
  const record = { event: 'blocked', origin, transport, expected, scenario: process.env.LCR_SCENARIO }
  appendFileSync(process.env.LCR_NETWORK_LOG, JSON.stringify(record) + '\n')
  if (!expected) process.exitCode = 1
  return new Error('LCR egress blocked: ' + origin)
}
