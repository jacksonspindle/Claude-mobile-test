import './globals.css'

export const metadata = {
  title: 'NYC Live Music Tonight',
  description: 'Find live music events happening today in NYC',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
