# ADR — isolamento de testes e produção
Status: implementação proposta no PR; validação depende do CI.
Contexto: testes de navegador podem consultar backend e imagens reais; múltiplos smokes publicados amplificam consumo.
Decisão: manter aplicação e assets existentes; fixtures locais e namespace Linux sem rede externa para todos os testes comuns. Separar deploy e smoke estático com orçamento. Não criar serviço real novo; integração autenticada depende de autorização.
Alternativas: somente mocks no navegador (não protege Node/CLI/redirects); segundo Supabase (custo e autorização); remover cobertura (inaceitável).
Consequências: ambiente Linux requerido, fixture representa contrato e não substitui integração real. Preservar testes e relatórios, não aprovar se gate falhar. Consultar candidato 01 antes de marcar ADR final; numeração não atribuída.
