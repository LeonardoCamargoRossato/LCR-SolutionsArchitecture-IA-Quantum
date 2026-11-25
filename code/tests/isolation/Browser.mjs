import { chromium as native } from 'playwright'
import { assertIsolated, isAllowed, blocked } from './Environment.mjs'

assertIsolated()

// The OS namespace is the mandatory backstop (redirects, subprocesses, native
// sockets, DNS, browser background traffic). Browser events add attribution.
// Do not route every request: Playwright routing disables HTTP caching.
async function instrument(context) {
  context.on('request', request => {
    if (!isAllowed(request.url())) blocked(request.url(), 'browser-request')
  })
  const attach = page => page.on('websocket', socket => {
    if (!isAllowed(socket.url())) blocked(socket.url(), 'browser-websocket')
  })
  context.on('page', attach)
  for (const page of context.pages()) attach(page)
  return context
}

export const chromium = {
  async launch(options = {}) {
    const browser = await native.launch({
      ...options,
      args: [...(options.args ?? []), '--disable-background-networking', '--disable-component-update', '--no-proxy-server'],
    })
    const newContext = browser.newContext.bind(browser)
    browser.newContext = async (options = {}) => instrument(await newContext({ ...options, serviceWorkers: 'block' }))
    browser.newPage = async (options = {}) => (await browser.newContext(options)).newPage()
    return browser
  },
}
