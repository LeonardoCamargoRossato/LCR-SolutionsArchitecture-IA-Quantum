import { assertIsolated, isAllowed, blocked } from './Environment.mjs'
assertIsolated()

const originalFetch = globalThis.fetch
globalThis.fetch = async function(input, init) {
  const url = input instanceof Request ? input.url : String(input)
  if (!isAllowed(url)) throw blocked(url, 'node-fetch')
  // Follow redirects explicitly so an external Location never reaches a socket.
  const max = 10
  let target = input
  let options = init
  for (let i = 0; i <= max; i++) {
    const requested = target instanceof Request ? target.url : String(target)
    const result = await originalFetch(target, { ...options, redirect: 'manual' })
    const location = result.headers.get('location')
    if (!location || ![301,302,303,307,308].includes(result.status) || init?.redirect === 'manual') return result
    if (init?.redirect === 'error') throw Error('Redirect forbidden')
    const next = new URL(location, requested)
    if (!isAllowed(next)) throw blocked(next, 'node-fetch-redirect')
    // Tests use GET/HEAD for local readiness; do not silently replay mutations.
    const method = options?.method ?? (target instanceof Request ? target.method : 'GET')
    if (!['GET','HEAD'].includes(method.toUpperCase())) throw Error('Redirect for mutating fixture request forbidden')
    target = next
  }
  throw Error('Too many local redirects')
}
