import { createServer } from 'node:http'
import { readFile, appendFile } from 'node:fs/promises'
import { build } from 'esbuild'
import { assertIsolated, FIXTURE_URL } from './Environment.mjs'
assertIsolated()
const compiled = await build({entryPoints:['tests/isolation/FixtureData.ts'],bundle:true,platform:'node',format:'esm',write:false,
  define:{'import.meta.env.BASE_URL':JSON.stringify('/LCR-SolutionsArchitecture-IA-Quantum/')}})
const { tables } = await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'))
const images={
  png:await readFile('public/projects/cities-comparing/series-compare/PNG/Research_Platform_Series_Compare_01.png'),
  webp:await readFile('public/projects/cities-comparing/series-compare/WebP/Research_Platform_Series_Compare_01.webp'),
  jpg:await readFile('public/assets/branding/social/lcr-portfolio-og-wa.jpg'),
}
// Separate opt-in read-only fixture for equivalent real-media measurements.
// The default synthetic fixture and its historic tests remain unchanged.
const approved=JSON.parse(await readFile('tests/isolation/ApprovedMainFixture.json','utf8'))
const inventory=JSON.parse(await readFile('docs/assets/supabase-public-assets-inventory.json','utf8'))
const approvedAssets=new Map(inventory.assets.filter(x=>x.github_path?.startsWith('code/public/')&&!x.github_path.split('/').includes('..'))
  .map(x=>[x.supabase_path,x]))
const prefix='/storage/v1/object/public/portfolio-media/'
const user={id:'00000000-0000-4000-8000-000000000001',email:'qa-viewer@example.invalid',aud:'authenticated',role:'authenticated',app_metadata:{provider:'email'},user_metadata:{},created_at:'2026-01-01T00:00:00Z'}
const b64=x=>Buffer.from(JSON.stringify(x)).toString('base64url')
function json(res,status,value) { res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(value)) }
const server=createServer(async(req,res)=>{
  const url=new URL(req.url,FIXTURE_URL)
  const approvedMode=req.headers['x-lcr-fixture-mode']==='approved-main'
  if(approvedMode)res.setHeader('Vary','X-LCR-Fixture-Mode')
  res.setHeader('Access-Control-Allow-Origin','*')
  res.setHeader('Access-Control-Allow-Headers','*')
  res.setHeader('Access-Control-Allow-Methods','GET,HEAD,POST,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Expose-Headers','Content-Range,Content-Type')
  if(req.method==='OPTIONS'){res.writeHead(204);return res.end()}
  if(url.pathname==='/health')return json(res,200,{fixture:true})
  if(url.pathname==='/probe/redirect'&&process.env.LCR_GUARD_SELF_TEST==='1'){res.writeHead(302,{Location:'https://lcr-egress-probe.invalid/'});return res.end()}
  if(url.pathname==='/probe/error')return json(res,503,{message:'Synthetic error'})
  if(url.pathname==='/auth/v1/token'&&req.method==='POST'){
    let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>4096)return json(res,413,{message:'Fixture request too large'})}
    let body;try{body=JSON.parse(raw)}catch{return json(res,400,{message:'Invalid JSON'})}
    if(body.email!==user.email||body.password!=='fixture-password-not-secret')return json(res,400,{error:'invalid_grant',error_description:'Invalid fixture credentials'})
    const exp=Math.floor(Date.now()/1000)+3600
    return json(res,200,{access_token:b64({alg:'HS256',typ:'JWT'})+'.'+b64({sub:user.id,exp,role:'authenticated',aud:'authenticated',email:user.email})+'.fixture',refresh_token:'fixture-refresh-not-secret',expires_in:3600,expires_at:exp,token_type:'bearer',user})
  }
  if(url.pathname==='/auth/v1/user'&&req.method==='GET')return json(res,200,user)
  if(url.pathname==='/auth/v1/logout'&&req.method==='POST'){res.writeHead(204);return res.end()}
  if(url.pathname.startsWith('/rest/v1/')&&req.method==='GET'){
    const table=url.pathname.slice('/rest/v1/'.length)
    const source=approvedMode?approved.tables:tables
    if(!Object.hasOwn(source,table)&&!approvedMode)return json(res,404,{message:'Unknown local fixture table'})
    let rows=Object.hasOwn(source,table)?source[table]:[]
    for(const [key,value] of url.searchParams){
      if(value.startsWith('eq.'))rows=rows.filter(row=>String(row[key])===value.slice(3))
    }
    const order=url.searchParams.get('order')
    if(order){const field=order.split('.')[0];rows=[...rows].sort((a,b)=>Number(a[field]??0)-Number(b[field]??0))}
    res.setHeader('Content-Range',rows.length?'0-'+(rows.length-1)+'/'+rows.length:'*/0')
    return json(res,200,req.headers.accept?.includes('vnd.pgrst.object+json')?(rows[0]??null):rows)
  }
  if(url.pathname.startsWith(prefix)&&['GET','HEAD'].includes(req.method)){
    const path=decodeURIComponent(url.pathname.slice(prefix.length))
    const extension=path.split('.').pop().toLowerCase()
    if(approvedMode){
      const asset=approvedAssets.get(path)
      if(!asset)return json(res,404,{message:'Uninventoried approved fixture asset'})
      const data=await readFile(asset.github_path.replace(/^code\//,''))
      if(asset.size_bytes!==data.length)return json(res,500,{message:'Approved fixture asset length mismatch'})
      // Synthetic cache policy for the controlled lab only, not production.
      res.writeHead(200,{'Content-Type':asset.format,'Content-Length':data.length,'Cache-Control':'public,max-age=600'})
      await appendFile(process.env.LCR_NETWORK_LOG,JSON.stringify({event:'approved-fixture-media',format:asset.format,path,bytes:req.method==='HEAD'?0:data.length})+'\n')
      return res.end(req.method==='HEAD'?undefined:data)
    }
    const allowed=/^about\/gallery\/(?:PNG\/|WebP\/)?fixture-photo-\d{2}\.(?:jpg|png|webp)$/.test(path)||
      /^projects\/[a-z0-9-]+\/(?:PNG|WebP)\/[a-z0-9-]+-cover\.(?:png|webp)$/.test(path)||
      /^institutions\/[A-Za-z0-9_-]+\.png$/.test(path)
    if(!allowed||!images[extension])return json(res,404,{message:'Unknown local fixture asset'})
    const data=images[extension]
    res.writeHead(200,{'Content-Type':'image/'+(extension==='jpg'?'jpeg':extension),'Content-Length':data.length,'Cache-Control':'public,max-age=600'})
    await appendFile(process.env.LCR_NETWORK_LOG,JSON.stringify({event:'fixture-media',format:extension,bytes:req.method==='HEAD'?0:data.length})+'\n')
    return res.end(req.method==='HEAD'?undefined:data)
  }
  return json(res,403,{message:'Fixture contract denies this operation'})
})
server.listen(54321,'127.0.0.1',()=>console.log('Local fixture server ready'))
