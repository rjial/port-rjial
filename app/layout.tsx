import Navbar from '@/components/common/Navbar'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'rjial',
  description: 'I am a passionate and experienced full-stack developer based in Malang, Indonesia. With expertise in PHP, JavaScript, Laravel, React, and Vue, I specialize in crafting dynamic and efficient web applications.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <Navbar/>
        {children}
        </body>
    </html>
  )
}
