// pages/_app.tsx
import type { AppProps } from 'next/app.tsx'
import '../../tailwind.css'   // ← your global CSS entrypoint

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
