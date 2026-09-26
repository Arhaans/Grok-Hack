import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono, IBM_Plex_Sans } from 'next/font/google'
import { Courier_Prime } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _courierPrime = Courier_Prime({ weight: ["400", "700"], subsets: ["latin"] });
const _ibmPlexSans = IBM_Plex_Sans({ weight: ["300", "400", "500", "600"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Prism — Agent Identity for Commerce',
  description: 'Prism gives every AI shopping agent an identity, creates a unique experience to maximize leads, and stops copycats before they steal the sale.',
  keywords: ['agent commerce', 'AI shopping agents', 'agent identity', 'lead optimization', 'copycat protection'],
  authors: [{ name: 'Prism' }],
  openGraph: {
    title: 'Prism — Agent Identity for Commerce',
    description: 'Give every agent an identity, route unique experiences, maximize leads, and stop copycats.',
    type: 'website',
    url: 'https://prism-commerce.ai',
    siteName: 'Prism',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prism — Agent Identity for Commerce',
    description: 'Every agent gets a unique experience. Copycats get stopped.',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
