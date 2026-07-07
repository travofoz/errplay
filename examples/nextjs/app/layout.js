import DevTools from '../components/DevTools'

export const metadata = {
  title: 'errplay Demo',
  description: 'Demo app for errplay — client-side error logger',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <DevTools />
      </body>
    </html>
  )
}
