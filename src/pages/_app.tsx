import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Image from "next/image";
import { Inter } from "next/font/google";
import { LuRefreshCw } from 'react-icons/lu'
import { BsArrowUpRight } from 'react-icons/bs'
import { useRouter } from 'next/router'
import Link from 'next/link';
import {motion} from 'framer-motion'

const inter = Inter({ subsets: ["latin"] });
export default function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter()
  return (
    <main
      className={`bg-background min-h-screen min-w-screen ${inter.className}  overflow-x-hidden`}
    >
      <nav className="w-screen flex justify-between items-center px-14 py-14">
        <span style={{ fontFamily: "Moranga Bold" }} className="text-3xl">
          rahmat
          <br /> rhomadoni
        </span>
        <div
          className="px-3 py-2 bg-gray-200 rounded-full flex space-x-2"
          style={{ fontFamily: "Silka Medium" }}
        >
          {menuItems.map((item, i) => (
            <Link href={item.path} key={item.id} className={`px-3 py-2 text-sm relative`}>
              {pathname == item.path ? <motion.div layoutId='menuItem' style={{borderRadius: "9999px"}} className="absolute bg-white inset-0"></motion.div> : <></>}
              <span className="relative z-10">{item.name}</span>
            </Link>
          ))}
        </div>
        <span style={{ fontFamily: "Silka Medium" }}>contact</span>
      </nav>
      <div className="px-24 mb-16">
        <Component {...pageProps} />
      </div>
    </main>
  );
}


interface MenuItems {
  id: number;
  name: string;
  path: string;
}

const menuItems: Array<MenuItems> = [
  { id: 1, name: "Home", path: "/" },
  { id: 2, name: "About", path: "/about" },
  { id: 3, name: "Project", path: "/project" },
  { id: 4, name: "Tools", path: "/tools" },
];

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return <div className={`p-10 rounded-3xl ${className}`}>{children}</div>;
};
const CardImage = ({ children, className, src, alt, width, height }: { children: React.ReactNode, className?: string, src: string, alt: string, width: number, height: number }) => {

  return (
    <div className={`rounded-3xl ${className}`}>
      {children}
      <Image alt={alt} src={src} width={width} height={height} className="rounded-3xl object-cover w-full h-full" />
    </div>
  );
};
