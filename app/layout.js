import './globals.css'

export const metadata = {
  title: 'NYC Free Live Music Tonight',
  description: 'Find free live music events happening today in NYC',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
