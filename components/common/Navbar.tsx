'use client'

import Link from "next/link"
import { useState } from "react"
import { RxHamburgerMenu } from 'react-icons/rx'

export default () => {
  const [showNav, setShowNav] = useState<boolean>(false);
  return (
    <div className="fixed w-full">
      <div className="flex justify-between px-16 py-10 items-center ">
        <h1 className="text-white font-extrabold">rjial</h1>
        <div className="lg:flex lg:justify-between space-x-3 text-white hidden">
          <Link href="/"><div className="py-2 px-4 hover:bg-white/10 rounded-md transition ease-in-out">Home</div></Link>
          <Link href="/about"><div className="py-2 px-4 hover:bg-white/10 rounded-md transition ease-in-out">About</div></Link>
          <Link href="/contact"><div className="py-2 px-4 hover:bg-white/10 rounded-md transition ease-in-out">Contact</div></Link>
        </div>
        <div className="block lg:hidden static">
          <button onClick={() => setShowNav(!showNav)} className="py-2 px-4 z-50  text-white hover:bg-white/10 rounded-md transition ease-in-out ">
            <RxHamburgerMenu className="text-white text-2xl" />
          </button>
          
          {showNav ? <><div onClick={() => setShowNav(!showNav)} className="absolute w-screen h-screen left-0 top-0 z-30">
          </div><div className="absolute bottom-120 w-screen right-0 mt-3 z-40">
            <div className="bg-[#1e1e1e] outline outline-1 outline-zinc-800 mx-16 p-4 rounded-md text-white flex flex-col space-y-3">
              <Link onClick={() => setShowNav(!showNav)} href="/" className="py-2 px-4 hover:bg-white/10 rounded-md transition ease-in-out">Home</Link>
              <Link onClick={() => setShowNav(!showNav)} href="/about" className="py-2 px-4 hover:bg-white/10 rounded-md transition ease-in-out">About</Link>
              <Link onClick={() => setShowNav(!showNav)} href="/contact" className="py-2 px-4 hover:bg-white/10 rounded-md transition ease-in-out">Contact</Link>
            </div>
          </div></> : <></>}
        </div>
      </div>
    </div>
  )
}