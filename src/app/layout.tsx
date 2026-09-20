import type { Metadata } from 'next'
import { JetBrains_Mono, DM_Sans } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })
const sans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Gatekeeper',
  description: 'AI prompt injection scanner',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${mono.variable} ${sans.variable}`} style={{ fontFamily: 'var(--font-mono)' }}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
