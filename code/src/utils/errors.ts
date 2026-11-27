
export function humanizeError(error: unknown) {
  const raw =
    error instanceof Error
      ? error.message
      : String(error ?? '')

  const code =
    (error as { code?: string; status?: number; statusCode?: string | number })
      ?.code ?? ''

  const lower = raw.toLowerCase()
  console.error(error)

  if (!raw) return 'O Supabase não retornou detalhes do erro.'

  if (
    raw.includes('Formato não suportado') ||
    raw.includes('excede o limite')
  ) {
    return raw
  }

  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid credentials')
  ) {
    return 'Email ou senha incorretos.'
  }

  if (
    lower.includes('email not confirmed')
  ) {
    return 'O email do administrador ainda não foi confirmado no Supabase.'
  }

  if (
    lower.includes('row-level security') ||
    lower.includes('rls') ||
    lower.includes('permission denied') ||
    code.includes('42501')
  ) {
    return `Você não possui permissão para esta alteração. ${raw}`
  }

  if (lower.includes('bucket') && lower.includes('not found')) {
    return `Bucket não encontrado. ${raw}`
  }

  if (
    lower.includes('invalid api key') ||
    lower.includes('apikey') ||
    lower.includes('jwt')
  ) {
    return `Falha de autenticação/configuração do Supabase. ${raw}`
  }

  if (
    lower.includes('failed to fetch') ||
    lower.includes('network') ||
    lower.includes('load failed')
  ) {
    return `Falha de conexão com o Supabase. ${raw}`
  }

  return raw.length <= 260
    ? raw
    : `${raw.slice(0, 257)}...`
}
