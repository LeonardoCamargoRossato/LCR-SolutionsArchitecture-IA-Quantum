import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { chromium } from './Browser.mjs'
const base='http://127.0.0.1:5189/LCR-SolutionsArchitecture-IA-Quantum/'
const server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port','5189','--strictPort'],{stdio:'ignore',detached:true})
let browser
try {
  for(let i=0;i<100;i++){
    try{if((await fetch(base)).ok)break}catch{}
    if(i===99)throw Error('Local dev server unavailable')
    await new Promise(r=>setTimeout(r,250))
  }
  browser=await chromium.launch({headless:true,args:['--no-sandbox']})
  const page=await browser.newPage({viewport:{width:1280,height:800}})
  await page.goto(base+'#/admin')
  await page.getByText('This area is restricted.').waitFor()
  await page.locator('input[type=email]').fill('qa-viewer@example.invalid')
  await page.locator('input[type=password]').fill('bad-fixture-password')
  const denied=page.waitForResponse(r=>r.url().includes('/auth/v1/token')&&r.status()===400)
  await page.getByRole('button',{name:'Sign In',exact:true}).click()
  await denied
  await page.getByRole('button',{name:'Sign In',exact:true}).waitFor()
  assert.equal(await page.locator('.admin-shell').count(),0)
  await page.locator('input[type=password]').fill('fixture-password-not-secret')
  await page.getByRole('button',{name:'Sign In',exact:true}).click()
  await page.getByText('Access denied.',{exact:true}).waitFor()
  assert.equal(await page.locator('.admin-shell').count(),0)
  await mkdir('test-results/isolation',{recursive:true})
  await page.screenshot({path:'test-results/isolation/non-admin-denied.png'})
  await page.getByRole('button',{name:'Sign Out',exact:true}).click()
  await page.getByText('This area is restricted.').waitFor()
  console.log('PASS simulated invalid login, authenticated non-admin denied, sign-out')
} finally{
  if(browser)await browser.close()
  try{process.kill(-server.pid,'SIGTERM')}catch{}
}
