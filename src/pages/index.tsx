import Image, { StaticImageData } from "next/image";
import { Inter } from "next/font/google";
import { LuRefreshCw } from 'react-icons/lu'
import { BsArrowUpRight } from 'react-icons/bs'
import { useRouter } from 'next/router'
import homescreen1 from '../../public/homescreen1.png'
import homescreenmaps from '../../public/homescreenmaps.png'
import latestproject from '../../public/latest_project.webp'
import map_light from '../../public/map_light.webp'
import projects from '../../public/projects.webp'

const inter = Inter({ subsets: ["latin"] });

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
const CardImage = ({ children, className, src, alt, width, height }: { children: React.ReactNode, className?: string, src: string | StaticImageData, alt: string, width: number, height: number }) => {

  return (
    <div className={`rounded-3xl ${className}`}>
      {children}
      <Image alt={alt} src={src} width={width} height={height} className="rounded-3xl object-cover w-full h-full" />
    </div>
  );
};

export default function Home() {
  const { pathname } = useRouter()
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 grid-rows-4 gap-4">
        <div className="col-span-2 m-0">
          <Card className="relative bg-white h-72">
            <div className="absolute top-0 right-0 p-6">
              <span className="flex items-center px-4 py-3 text-sm rounded-full box-solid-shadow" style={{ fontFamily: "Silka Medium" }}><LuRefreshCw className="text-lg mr-3" />Toggle Lockdown</span>
            </div>
            <div className="flex flex-col space-y-5">
              <Image
                width={90}
                height={90}
                src="/homescreen1.png"
                alt="avatar1"
              ></Image>
              <span style={{ fontFamily: "Silka" }} className="leading-7">
                hello, im <span style={{ fontFamily: "Moranga Bold" }} className="text-2xl">dhoni</span>,
                <br />
                interested in ui/ux research development
                <br />
                welcome to my portfolio website!
              </span>
            </div>
          </Card>
        </div>
        <div>
          <Card className="flex justify-center items-center h-72 bg-white">
            dark/light mode
          </Card>
        </div>
        <div>
          <Card className="flex justify-center items-center h-72 bg-blue-500 relative">
            <div className="absolute bottom-0 left-0">
              <span>
                <BsArrowUpRight size={36} className="bg-white rounded-full p-3 m-5 transition duration-200 " />
              </span>
            </div>
            <svg width="75.121" height="61.052" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.98 2.5C4.98 3.881 3.87 5 2.5 5C1.13 5 0.02 3.881 0.02 2.5C0.02 1.12 1.13 0 2.5 0C3.87 0 4.98 1.12 4.98 2.5ZM5 7H0V23H5V7ZM12.982 7H8.014V23H12.983V14.601C12.983 9.931 19.012 9.549 19.012 14.601V23H24V12.869C24 4.989 15.078 5.276 12.982 9.155V7Z" fill="white"></path>
            </svg>
          </Card>
        </div>
        <div className="col-span-2">
          <Card className="flex flex-col items-start justify-between h-72 bg-white ">
            <div className="flex flex-col space-y-2">
              <span style={{ fontFamily: "Moranga Bold" }} className="text-2xl">About me!</span>
              <span style={{ fontFamily: "Silka" }}>let's know about me by reading the portfolio of myself</span>
            </div>
            <button style={{ fontFamily: "Silka" }} className="rounded-full box-solid-shadow p-3 text-sm flex items-center"><BsArrowUpRight className="mr-3" />read more about my self</button>
          </Card>
        </div>
        <div className="col-span-2">
          <CardImage width={1083} height={361} alt="latest project" src="/latest_project.webp" className="bg-white h-72 relative">
            <div className="absolute bottom-0 left-0 p-5">
              <button style={{ fontFamily: "Silka" }} className="bg-white rounded-full outline outline-2 outline-gray-300 p-3 text-sm flex items-center">Latest Project<BsArrowUpRight className="ml-3" /></button>
            </div>
          </CardImage>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 grid-rows-4 gap-4">
        <div>
          <CardImage width={1083} height={361} alt="latest project" src="/map_light.webp" className="bg-white flex justify-center items-center h-72 relative">
            <Image src="/homescreenmaps.png" width={301} height={400} alt="avatar 2" className="h-3/6 w-3/6 rounded-full object-scale-down absolute p-8 outline-white outline outline-3 bg-blue-300/50" />
          </CardImage>
        </div>
        <div className="row-span-2 col-span-1">
          <CardImage width={780} height={1444} alt="latest project" src="/projects.webp" className="bg-white h-full relative">
            <div className="absolute bottom-0 left-0 p-5">
              <span style={{ fontFamily: "Silka" }} className="bg-white rounded-full box-solid-shadow p-3 text-sm flex items-center">Latest Project<BsArrowUpRight className="ml-3" /></span>
            </div>
          </CardImage>
          {/* <Card className="flex justify-center items-center h-full bg-blue-500">
                <svg width="75.121" height="61.052" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.98 2.5C4.98 3.881 3.87 5 2.5 5C1.13 5 0.02 3.881 0.02 2.5C0.02 1.12 1.13 0 2.5 0C3.87 0 4.98 1.12 4.98 2.5ZM5 7H0V23H5V7ZM12.982 7H8.014V23H12.983V14.601C12.983 9.931 19.012 9.549 19.012 14.601V23H24V12.869C24 4.989 15.078 5.276 12.982 9.155V7Z" fill="white"></path>
                </svg>
              </Card> */}
        </div>
        <div className="row-span-2">
          <Card className="flex justify-center items-center h-full bg-blue-500">
            <svg width="75.121" height="61.052" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.98 2.5C4.98 3.881 3.87 5 2.5 5C1.13 5 0.02 3.881 0.02 2.5C0.02 1.12 1.13 0 2.5 0C3.87 0 4.98 1.12 4.98 2.5ZM5 7H0V23H5V7ZM12.982 7H8.014V23H12.983V14.601C12.983 9.931 19.012 9.549 19.012 14.601V23H24V12.869C24 4.989 15.078 5.276 12.982 9.155V7Z" fill="white"></path>
            </svg>
          </Card>
        </div>
        <div><Card className="flex justify-center items-center h-full bg-blue-500">
          <svg width="75.121" height="61.052" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.98 2.5C4.98 3.881 3.87 5 2.5 5C1.13 5 0.02 3.881 0.02 2.5C0.02 1.12 1.13 0 2.5 0C3.87 0 4.98 1.12 4.98 2.5ZM5 7H0V23H5V7ZM12.982 7H8.014V23H12.983V14.601C12.983 9.931 19.012 9.549 19.012 14.601V23H24V12.869C24 4.989 15.078 5.276 12.982 9.155V7Z" fill="white"></path>
          </svg>
        </Card></div>
        <div className="col-span-2">
          <Card className="flex justify-center items-center h-full bg-blue-500">
            <svg width="75.121" height="61.052" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.98 2.5C4.98 3.881 3.87 5 2.5 5C1.13 5 0.02 3.881 0.02 2.5C0.02 1.12 1.13 0 2.5 0C3.87 0 4.98 1.12 4.98 2.5ZM5 7H0V23H5V7ZM12.982 7H8.014V23H12.983V14.601C12.983 9.931 19.012 9.549 19.012 14.601V23H24V12.869C24 4.989 15.078 5.276 12.982 9.155V7Z" fill="white"></path>
            </svg>
          </Card>
        </div>
      </div>
    </div>
  );
}
