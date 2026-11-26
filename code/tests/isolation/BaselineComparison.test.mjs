import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir,writeFile } from 'node:fs/promises'
import { chromium } from './Browser.mjs'
// Exact, source-verified editorial differences: the immutable historical
// code fallback (7b5d0ad) and the approved public CMS export from main
// (67e8877) render different, explicitly identified AnimeFinder sections.
// Evidence: isolation job 140160287982. No baseline replacement or generic
// normalization: both versions must match each exact block and all remaining
// text must still compare byte-for-byte.
const animeFinderEditorialDelta=[
  {
    "heading": "OVERVIEW",
    "next": "CHALLENGE",
    "historical": "\nAnimeFinder combines a private anime discovery/catalog interface with Hamlet AI, an AI-assisted conversation experience, and a personal Self-Knowledge engine. Public anime metadata comes from Jikan/MyAnimeList while private catalog data is held in Supabase.\n\nThe codebase provides a React/TypeScript web interface and authenticated Supabase Edge Functions; the user interface requires authorized account access.\n",
    "approved": "\nAnimeFinder is a private anime discovery/catalog and personal knowledge platform built with React/TypeScript and Supabase; Jikan/MyAnimeList provides public anime metadata.\n\nIts AI layer consists of Hamlet AI conversational intent and a Self-Knowledge retrieval engine backed by authenticated Edge Functions.\n"
  },
  {
    "heading": "CHALLENGE",
    "next": "SOLUTION",
    "historical": "\nDifferent questions require different evidence: a structured catalog lookup, a statistical comparison of saved works, or semantic retrieval over personal notes and character descriptions. A single generic prompt cannot reliably provide all of these.\n\nKeep private preferences and conversations protected while giving the language model a bounded, traceable evidence package.\n",
    "approved": "\nCombine structured catalog information, personal statistics, semantic notes and language-model reasoning while keeping private content protected.\n"
  },
  {
    "heading": "SOLUTION",
    "next": "ARCHITECTURE & SCOPE",
    "historical": "\nA deterministic query classifier routes requests to structured, statistical, semantic or hybrid analysis. The SelfKnowledgeService calls an authenticated Edge Function, which builds evidence from the normalized personal catalog and derived semantic documents.\n\nThe reasoning layer receives only bounded retrieved evidence. Anime discovery also uses a separate Hamlet search service that turns generated intent into real catalog queries, not invented recommendations.\n",
    "approved": "\nClassify questions into structured, statistical, semantic or hybrid routes. The authenticated SelfKnowledgeService and Supabase Edge Function build bounded evidence from normalized master data and derived semantic documents.\n\nThe separate Hamlet AI search service translates model intent into real provider queries and watched exclusions.\n"
  },
  {
    "heading": "ARCHITECTURE & SCOPE",
    "next": "KEY FEATURES",
    "historical": "\n1. User Query → 2. Query Classification → 3. Structured / Statistical / Semantic Retrieval → 4. Evidence Package → 5. Gemini LLM → 6. Contextual Response.\n\nThe browser-facing SelfKnowledgeService invokes the hamlet-self-knowledge Edge Function. Server-side orchestration connects normalized PostgreSQL master data, statistical aggregations and derived pgvector documents indexed by HNSW. The separate hamlet-ai Edge Function handles conversational intent and Gemini model fallbacks.\n\n01\nReact + TypeScript / Vite frontend\n02\nSupabase Auth and Edge Functions\n03\nPostgreSQL normalized personal catalog\n04\nEmbeddings derived from personal knowledge\n05\npgvector + HNSW for semantic retrieval\n06\nStructured, statistical, semantic and hybrid query routing\n07\nEvidence package → Gemini generation",
    "approved": "\nUser Query → Query Classification → Structured / Statistical / Semantic Retrieval → Evidence Package → Gemini LLM → Contextual Response.\n\nPostgreSQL master data plus derived pgvector/HNSW knowledge index; Supabase Edge Functions hamlet-ai and hamlet-self-knowledge provide secure AI orchestration.\n\n01\nReact / TypeScript / Vite\n02\nSupabase Auth / Edge Functions\n03\nPostgreSQL and pgvector/HNSW\n04\nEmbeddings / Semantic Retrieval\n05\nStatistical Analysis / Hybrid Query Routing\n06\nGemini LLM\n07\nEvidence-grounded Response"
  },
  {
    "heading": "KEY FEATURES",
    "next": "MY ROLE",
    "historical": "✓\nAnime search with filters and watched exclusions\n✓\nAuthenticated personal catalog and structured metadata\n✓\nHamlet AI conversation and intent classification\n✓\nSelf-Knowledge analysis of user-provided personal data\n✓\nVector embeddings and semantic retrieval of derived documents\n✓\nStatistical analysis of rankings, statuses and preferences\n✓\nSource-linked evidence for contextual responses",
    "approved": "✓\nPrivate catalog and watched exclusions\n✓\nSearch filters and provider-based recommendations\n✓\nHamlet AI conversational intent\n✓\nSelf-Knowledge query classification and statistical analysis\n✓\nDerived embeddings and semantic retrieval\n✓\nAuthenticated Edge Functions and bounded evidence"
  },
  {
    "heading": "MY ROLE",
    "next": "DELIVERED VALUE",
    "historical": "\nSystem architecture, application development, Supabase integration, AI-assisted retrieval flows and iterative validation within the personal research/software project.\n",
    "approved": "\nSolution architecture, implementation of the web application, Supabase integration, search/routing flows and AI-assisted validation.\n"
  },
  {
    "heading": "DELIVERED VALUE",
    "next": "TECHNOLOGY STACK",
    "historical": "Repository evidence: React discovery workflow, authenticated catalog, search service and Self-Knowledge service/Edge Function are implemented.\nSupabase evidence: the hamlet-ai and hamlet-self-knowledge functions are deployed, and personal-knowledge database structures exist. This does not establish the accuracy or availability of any individual Gemini response.\nNo fabricated performance, adoption or business metrics.",
    "approved": "Repository contains the described frontend and Edge Function implementations. Both Edge Functions are deployed and Self-Knowledge tables exist; end-to-end model accuracy, throughput and business metrics were not independently measured."
  }
]
function reconcileHistoricalAnimeFinder(historical,approved){
  let expected=historical
  for(const change of animeFinderEditorialDelta){
    const from='\n'+change.heading+'\n'+change.historical+'\n'+change.next+'\n'
    const to='\n'+change.heading+'\n'+change.approved+'\n'+change.next+'\n'
    assert.equal(expected.split(from).length,2,'Missing/ambiguous exact historical block '+change.heading)
    assert.equal(approved.split(to).length,2,'Missing/ambiguous exact approved block '+change.heading)
    expected=expected.replace(from,to)
  }
  assert.equal(expected,approved,'Unapproved editorial difference outside exact AnimeFinder blocks')
}

const base='/LCR-SolutionsArchitecture-IA-Quantum/'
const before=process.env.LCR_BEFORE
assert(before)
const targets=[{name:'base',cwd:before,port:5191},{name:'candidate',cwd:process.cwd(),port:5192}]
const servers=targets.map(t=>spawn('npm',['run','preview','--','--host','127.0.0.1','--port',String(t.port),'--strictPort'],{cwd:t.cwd,stdio:'ignore',detached:true}))
let browser
const reports=[]
try{
  for(const t of targets)for(let i=0;i<100;i++){
    try{if((await fetch('http://127.0.0.1:'+t.port+base)).ok)break}catch{}
    if(i===99)throw Error('Preview unavailable '+t.name)
    await new Promise(r=>setTimeout(r,250))
  }
  browser=await chromium.launch({headless:true,args:['--no-sandbox']})
  await mkdir('test-results/isolation/baseline',{recursive:true})
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
    for(const slug of ['animefinder','ce235-real-time-systems']){
      const rows=[]
      for(const t of targets){
        const page=await browser.newPage({viewport,reducedMotion:'reduce'})
        await page.goto('http://127.0.0.1:'+t.port+base+'#/projects/'+slug)
        await page.locator('.case-story-cover').waitFor({timeout:30000})
        await page.locator('.case-story-cover').scrollIntoViewIfNeeded()
        await page.waitForFunction(()=>{const img=document.querySelector('.case-story-cover .progressive-image-main');return img?.complete&&img?.naturalWidth>0},null,{timeout:15000})
        const data=await page.evaluate(()=>({heading:document.querySelector('h1')?.textContent,cover:document.querySelector('.case-story-cover img')?.getAttribute('src'),docWidth:document.documentElement.scrollWidth,viewport:innerWidth,text:document.querySelector('main')?.innerText}))
        assert(data.heading&&data.cover)
        assert(data.docWidth<=data.viewport+2)
        await page.screenshot({path:'test-results/isolation/baseline/'+t.name+'-'+slug+'-'+viewport.width+'.png',animations:'disabled'})
        rows.push(data)
        await page.close()
      }
      assert.equal(rows[0].heading,rows[1].heading)
      assert.equal(rows[0].cover,rows[1].cover)
      const contentEqual=rows[0].text===rows[1].text
      if(slug==='animefinder'){
        reconcileHistoricalAnimeFinder(rows[0].text,rows[1].text)
        // Negative controls: neither source may drift, even inside an approved block.
        const change=animeFinderEditorialDelta[0]
        assert.throws(()=>reconcileHistoricalAnimeFinder(rows[0].text.replace(change.historical,change.historical+' unauthorized'),rows[1].text))
        assert.throws(()=>reconcileHistoricalAnimeFinder(rows[0].text,rows[1].text.replace(change.approved,change.approved+' unauthorized')))
        assert.throws(()=>reconcileHistoricalAnimeFinder(rows[0].text,rows[1].text+' unauthorized'))
      }else assert.equal(rows[0].text,rows[1].text)
      reports.push({slug,viewport,contentEqual,approvedEditorialEquivalence:true,coverEqual:true,overflow:false,
        ...(slug==='animefinder'?{historicalSha:'7b5d0ad67d9697b7338c945dfc7691ed8b0bd0d1',approvedMainSha:'67e8877b02fc23352306f75c04a40f4085b1f716',authorizedDelta:animeFinderEditorialDelta}: {})})
    }
  }
  await writeFile('test-results/isolation/baseline/comparison.json',JSON.stringify(reports,null,2))
  console.log('PASS immutable baseline/candidate comparisons: '+reports.length)
}finally{
  if(browser)await browser.close()
  for(const server of servers)try{process.kill(-server.pid,'SIGTERM')}catch{}
}
