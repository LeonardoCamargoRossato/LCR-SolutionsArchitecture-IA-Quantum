# LCR Agent Orchestration

This document is the portfolio-facing source for the agents, human gates and automated services used in the LCR Workflow. Human authorization remains required for material decisions and final publication.

## human
- Name EN: Human Decision-Maker
- Name PT: Decisor Humano
- Role EN: Owns intent, scope, consequential choices and final approval.
- Role PT: É responsável pela intenção, pelo escopo, pelas escolhas relevantes e pela aprovação final.
- Inputs EN: Problem context, alternatives, risks, implementation evidence and audit findings.
- Inputs PT: Contexto do problema, alternativas, riscos, evidências da implementação e achados de auditoria.
- Actions EN: Clarifies intent, authorizes material decisions, resolves scope changes and approves the concrete release.
- Actions PT: Esclarece a intenção, autoriza decisões relevantes, resolve mudanças de escopo e aprova a entrega concreta.
- Outputs EN: Approved direction, accepted risks, requested revisions or final publication authorization.
- Outputs PT: Direção aprovada, riscos aceitos, revisões solicitadas ou autorização final de publicação.
- Gate EN: No material scope change or publication advances without explicit human authorization.
- Gate PT: Nenhuma mudança relevante de escopo ou publicação avança sem autorização humana explícita.

## planner
- Name EN: Planner
- Name PT: Planner
- Role EN: Converts the problem into a bounded, reviewable technical plan.
- Role PT: Converte o problema em um plano técnico delimitado e revisável.
- Inputs EN: User intent, repository context, constraints, evidence and applicable guardrails.
- Inputs PT: Intenção do usuário, contexto do repositório, restrições, evidências e guardrails aplicáveis.
- Actions EN: Investigates the current system, identifies risks and alternatives, and defines acceptance criteria.
- Actions PT: Investiga o sistema atual, identifica riscos e alternativas e define critérios de aceite.
- Outputs EN: Technical plan, alternatives, assumptions, dependencies and approval points.
- Outputs PT: Plano técnico, alternativas, premissas, dependências e pontos de aprovação.
- Gate EN: The plan advances only when consequential choices are explicit and reviewable.
- Gate PT: O plano só avança quando as escolhas relevantes estão explícitas e revisáveis.

## builder
- Name EN: Builder / Codex
- Name PT: Builder / Codex
- Role EN: Implements the approved plan and produces reviewable evidence.
- Role PT: Implementa o plano aprovado e produz evidências revisáveis.
- Inputs EN: Approved plan, source code, editorial content and acceptance criteria.
- Inputs PT: Plano aprovado, código-fonte, conteúdo editorial e critérios de aceite.
- Actions EN: Changes code and assets, documents the result, runs checks and keeps scope aligned with the authorization.
- Actions PT: Altera código e assets, documenta o resultado, executa verificações e mantém o escopo alinhado à autorização.
- Outputs EN: Diff, build artifacts, tests, measurements and deployment candidate.
- Outputs PT: Diff, artefatos de build, testes, medições e candidato a publicação.
- Gate EN: Failed checks or new material decisions return the work to implementation or human review.
- Gate PT: Falhas ou novas decisões relevantes retornam o trabalho à implementação ou à revisão humana.

## ci
- Name EN: GitHub Actions / CI
- Name PT: GitHub Actions / CI
- Role EN: Executes repeatable automated build and deployment checks.
- Role PT: Executa verificações automatizadas e repetíveis de build e publicação.
- Inputs EN: Committed source code and workflow configuration.
- Inputs PT: Código versionado e configuração dos workflows.
- Actions EN: Installs dependencies, builds the application and publishes approved branches through configured workflows.
- Actions PT: Instala dependências, compila a aplicação e publica branches aprovadas pelos workflows configurados.
- Outputs EN: Check status, logs, build artifact and deployment result.
- Outputs PT: Status das verificações, logs, artefato de build e resultado do deploy.
- Gate EN: Automation supplies evidence; it does not replace independent audit or human approval.
- Gate PT: A automação fornece evidências; ela não substitui auditoria independente nem aprovação humana.

## auditor
- Name EN: General Auditor
- Name PT: Auditor Geral
- Role EN: Reviews quality, security, evidence and compliance independently from implementation.
- Role PT: Revisa qualidade, segurança, evidências e conformidade de forma independente da implementação.
- Inputs EN: Approved scope, implementation diff, tests, measurements and governing rules.
- Inputs PT: Escopo aprovado, diff da implementação, testes, medições e regras aplicáveis.
- Actions EN: Challenges assumptions, checks acceptance criteria and records material findings.
- Actions PT: Questiona premissas, verifica critérios de aceite e registra achados relevantes.
- Outputs EN: Findings, risk assessment and recommendation to correct, accept or proceed.
- Outputs PT: Achados, avaliação de riscos e recomendação para corrigir, aceitar ou avançar.
- Gate EN: Unresolved material findings return to Builder and affected checks are repeated.
- Gate PT: Achados materiais não resolvidos retornam ao Builder e as verificações afetadas são repetidas.

## specialist
- Name EN: Optional Specialist
- Name PT: Especialista Opcional
- Role EN: Adds focused expertise when the plan documents a specific need.
- Role PT: Adiciona conhecimento especializado quando o plano documenta uma necessidade específica.
- Inputs EN: A bounded question in research, security, quality or asset production.
- Inputs PT: Uma questão delimitada em pesquisa, segurança, qualidade ou produção de assets.
- Actions EN: Reviews or produces the specialist artifact without taking ownership of final approval.
- Actions PT: Revisa ou produz o artefato especializado sem assumir a aprovação final.
- Outputs EN: Specialist analysis, evidence or artifact linked to the main workflow.
- Outputs PT: Análise, evidência ou artefato especializado vinculado ao fluxo principal.
- Gate EN: Specialist advice returns to Planner, Builder or Auditor for integration and verification.
- Gate PT: A orientação especializada retorna ao Planner, Builder ou Auditor para integração e verificação.
