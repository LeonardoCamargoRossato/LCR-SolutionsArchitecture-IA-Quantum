/**
 * Conceptual engineering workspace based on AnimeFinder's documented
 * structured/statistical/semantic query routes. It never calls Gemini,
 * Supabase, external services, or evaluates the illustrative pseudocode.
 */
export function EngineeringWorkspace() {
  return (
    <div className="ai-workspace" data-testid="ai-engineering-workspace">
      <div className="ai-workspace-editor">
        <div className="ai-workspace-editor-head">
          <span className="ai-workspace-tab"><span className="ai-workspace-ts-mark">TS</span> query-router.ts</span>
          <span className="ai-workspace-concept">conceptual example</span>
        </div>
        <div className="ai-workspace-code" aria-label="Conceptual TypeScript query router">
          <div><span className="ai-code-dim">01</span><span className="ai-code-purple">type</span> <span className="ai-code-cyan">Route</span> =</div>
          <div><span className="ai-code-dim">02</span>  <span className="ai-code-yellow">'structured'</span> | <span className="ai-code-yellow">'statistical'</span> |</div>
          <div><span className="ai-code-dim">03</span>  <span className="ai-code-yellow">'semantic'</span></div>
          <div><span className="ai-code-dim">04</span></div>
          <div><span className="ai-code-dim">05</span><span className="ai-code-purple">async function</span> <span className="ai-code-cyan">answer</span>(query) {'{'}</div>
          <div><span className="ai-code-dim">06</span>  <span className="ai-code-purple">const</span> route = <span className="ai-code-cyan">classify</span>(query)</div>
          <div><span className="ai-code-dim">07</span>  <span className="ai-code-purple">const</span> evidence = <span className="ai-code-purple">await</span> <span className="ai-code-cyan">retrieve</span>(route)</div>
          <div><span className="ai-code-dim">08</span>  <span className="ai-code-purple">return</span> <span className="ai-code-cyan">reason</span>(query, evidence)</div>
          <div><span className="ai-code-dim">09</span>{'}'}</div>
        </div>
        <div className="ai-workspace-editor-foot">
          <span className="ai-workspace-dot" />
          <span>React / TypeScript</span>
          <span>Evidence-first design</span>
        </div>
      </div>

      <div className="ai-workspace-systems">
        <div className="ai-workspace-panel">
          <span className="ai-workspace-panel-heading">AI orchestration</span>
          <div className="ai-workspace-routing">
            <span className="ai-workspace-processor">Query router</span>
            <span className="ai-workspace-routing-lines" aria-hidden="true" />
            <span className="ai-workspace-processor ai-workspace-processor--accent">LLM</span>
          </div>
          <span className="ai-workspace-panel-foot">Grounded reasoning</span>
        </div>
        <div className="ai-workspace-panel">
          <span className="ai-workspace-panel-heading">Retrieval / Database</span>
          <div className="ai-workspace-data-lines" aria-hidden="true">
            <span /><span /><span />
          </div>
          <span className="ai-workspace-panel-foot">SQL + pgvector</span>
        </div>
        <div className="ai-workspace-panel ai-workspace-panel--result">
          <span className="ai-workspace-panel-heading">Execution / Results</span>
          <span className="ai-workspace-ready"><span className="ai-workspace-ready-indicator" /> Evidence prepared</span>
          <span className="ai-workspace-panel-foot">Simulated visualization</span>
        </div>
      </div>
    </div>
  )
}
