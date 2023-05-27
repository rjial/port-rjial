'use client'

import Link from "next/link"
import React, { useState } from "react"
import { RxHamburgerMenu } from 'react-icons/rx'

const MenuItemResp = ({children, onClick, href}: {children: React.ReactNode, onClick: React.MouseEventHandler<HTMLAnchorElement>, href: string}) => {
  return <Link onClick={onClick} href={href} className="py-2 px-4 hover:bg-white/10 rounded-md transition ease-in-out">{children}</Link>
}
const MenuItem = ({children, href}: {children: React.ReactNode, href: string}) => {
  return <Link href={href} className="py-2 px-4 hover:bg-white/10 rounded-md transition ease-in-out">{children}</Link>
}

export interface MenuDataType {
  id: number,
  name: string,
  path: string
}
export const menuData: Array<MenuDataType> = [
  {id: 0, name: "Home", path: "/"},
  {id: 1, name: "About", path: "/about"},
  {id: 2, name: "Contact", path: "/contact"},
]

export default () => {
  const [showNav, setShowNav] = useState<boolean>(false);
  return (
    <div className="fixed w-full">
      <div className="flex justify-between px-16 py-10 items-center ">
        <h1 className="text-white font-extrabold">rjial</h1>
        <div className="lg:flex lg:justify-between space-x-3 text-white hidden">
          {menuData.map(item => <MenuItem href={item.path}>{item.name}</MenuItem>)}
        </div>
        <div className="block lg:hidden static">
          <button onClick={() => setShowNav(!showNav)} className="py-2 px-4 z-50  text-white hover:bg-white/10 rounded-md transition ease-in-out ">
            <RxHamburgerMenu className="text-white text-2xl" />
          </button>
          
          {showNav ? <><div onClick={() => setShowNav(!showNav)} className="absolute w-screen h-screen left-0 top-0 z-30">
          </div><div className="absolute bottom-120 w-screen right-0 mt-3 z-40">
            <div className="bg-[#1e1e1e] outline outline-1 outline-zinc-800 mx-16 p-4 rounded-md text-white flex flex-col space-y-3">
              {menuData.map(item => <MenuItemResp onClick={() => setShowNav(!showNav)} href={item.path}>{item.name}</MenuItemResp>)}
            </div>
          </div></> : <></>}
        </div>
      </div>
    </div>
  )
}