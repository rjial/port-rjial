import Image from 'next/image'
import {BsLinkedin, BsGithub, BsInstagram} from 'react-icons/bs'
import dp from "../public/dp.jpg"

export default function Home() {
  return (
    <main className="">
      <div className='h-screen px-16 mx-auto pt-24 flex items-center justify-between'>
        <div className='lg:w-1/2'>
          <h1 className='text-white font-semibold sm:text-4xl lg:text-5xl text-3xl mb-6'>Hi!, I'm Rizal Abdul Basith </h1>
          <h4 className='text-gray-400 text-sm font-medium sm:text-lg lg:leading-8 leading-6'>I am a passionate and experienced full-stack developer based in Malang, Indonesia. </h4>
          <h4 className='text-gray-400 text-sm font-medium sm:text-lg lg:leading-8 leading-6 mb-9'>With expertise in PHP, JavaScript, Laravel, React, and Vue, I specialize in crafting dynamic and efficient web applications.</h4>
          <div className='flex items-center space-x-7 justify-between lg:justify-normal'>
            <button className='px-5 py-2.5 bg-sky-600 rounded-md text-white text-sm font-semibold transition-colors hover:bg-sky-500 duration-100'>Hire Me!</button>
            <div className='flex items-center space-x-4'>
              <a target='_blank' href="https://www.linkedin.com/in/rjial/"><BsLinkedin className='text-2xl text-white hover:shadow-md hover:shadow-white/20 transition-shadow'/></a>
              <a target='_blank' href="https://github.com/rjial"><BsGithub className='text-2xl text-white hover:shadow-md hover:shadow-white/20 transition-shadow'/></a>
              <a target='_blank' href="https://www.instagram.com/rjiaal/"><BsInstagram className='text-2xl text-white hover:shadow-md hover:shadow-white/20 transition-shadow'/></a>
            </div>
          </div>
        </div>
        <div className='hidden lg:block'>
          <Image src={dp} alt="display picture" priority={false} loading='lazy' className='h-96 w-96 rounded-full' unoptimized={true} />
        </div>
      </div>
    </main>
  )
}
