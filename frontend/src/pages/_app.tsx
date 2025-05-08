// pages/_app.tsx
import type { AppProps } from 'next/app.tsx'
import '../../tailwind.css'   // ← your global CSS entrypoint
import { AuthProvider } from '../lib/auth'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )
}
