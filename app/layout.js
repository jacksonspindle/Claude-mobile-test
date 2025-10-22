import './globals.css'

export const metadata = {
  title: 'NYC Affordable Live Music Tonight',
  description: 'Find free and affordable live music events (under $30) happening today in NYC',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
