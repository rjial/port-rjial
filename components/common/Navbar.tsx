import Link from "next/link"

export default () => {
  return (
    <div className="fixed w-full">
      <div className="flex justify-between px-16 py-10 items-center ">
        <h1 className="text-white font-extrabold">rjial</h1>
        <div className="flex justify-between space-x-3 text-white">
          <Link href="/"><div className="py-2 px-4 hover:bg-white/10 rounded-md transition ease-in-out">Home</div></Link>
          <Link href="/about"><div className="py-2 px-4 hover:bg-white/10 rounded-md transition ease-in-out">About</div></Link>
          <Link href="/contact"><div className="py-2 px-4 hover:bg-white/10 rounded-md transition ease-in-out">Contact</div></Link>
        </div>
      </div>
    </div>
  )
}