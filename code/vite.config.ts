import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const fixtureUrl = 'http://127.0.0.1:54321'
const fixtureKey = 'lcr-fixture-public-key-not-a-secret'

export default defineConfig(({ command, mode, isPreview }) => {
  const testing = process.env.LCR_TEST_MODE === '1'
  const profileNoBackend = process.env.LCR_PROFILE_NO_BACKEND === '1'
  if (profileNoBackend && !testing) throw new Error('Profile offline simulation requires isolated tests')
  if (testing) {
    if (process.env.VITE_SUPABASE_URL !== fixtureUrl ||
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY !== fixtureKey ||
        process.env.VITE_SUPABASE_MEDIA_BUCKET !== 'portfolio-media' ||
        process.env.LCR_ISOLATED_NETNS !== '1') {
      throw new Error('LCR test environment rejected: use npm run test:isolated -- <test command>')
    }
    // Ignore .env/.env.local entirely, including developer production credentials.
    return {
      plugins: [react()],
      base: '/LCR-SolutionsArchitecture-IA-Quantum/',
      envDir: false as const,
      define: {
        'import.meta.env.VITE_SUPABASE_URL': profileNoBackend ? 'undefined' : JSON.stringify(fixtureUrl),
        'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': profileNoBackend ? 'undefined' : JSON.stringify(fixtureKey),
        'import.meta.env.VITE_SUPABASE_MEDIA_BUCKET': JSON.stringify('portfolio-media'),
        'import.meta.env.VITE_LCR_TEST_MODE': JSON.stringify('1'),
      },
    }
  }
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  if (env.VITE_LCR_TEST_MODE === '1' || env.VITE_SUPABASE_URL === fixtureUrl ||
      env.VITE_SUPABASE_PUBLISHABLE_KEY === fixtureKey) {
    throw new Error('Fixture configuration cannot be used in a normal build/development session')
  }
  if (command === 'serve' && !isPreview && env.VITE_SUPABASE_URL &&
      process.env.LCR_ALLOW_LIVE_DEV !== '1') {
    throw new Error('Real backend disabled by default in dev. Use isolated tests; live development requires explicit authorization.')
  }
  return {
    plugins: [react()],
    base: '/LCR-SolutionsArchitecture-IA-Quantum/',
  }
})
