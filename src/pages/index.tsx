import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

interface MenuItems {
  id: number;
  name: string;
  path: string;
}

export const menuItems: Array<MenuItems> = [
  { id: 1, name: "Home", path: "/" },
  { id: 2, name: "About", path: "/about" },
  { id: 3, name: "Project", path: "/project" },
  { id: 4, name: "Tools", path: "/tools" },
];

const Card = ({ children }: { children: React.ReactNode }) => {
  return <div className="bg-white p-10 rounded-3xl">{children}</div>;
};

export default function Home() {
  return (
    <main
      className={`bg-background min-h-screen min-w-screen ${inter.className}`}
    >
      <nav className="w-screen flex justify-between items-center px-16 py-16 fixed">
        <span style={{ fontFamily: "Moranga Bold" }} className="text-3xl">
          rahmat
          <br /> rhomadoni
        </span>
        <div
          className="px-3 py-2 bg-gray-200 rounded-full flex space-x-2"
          style={{ fontFamily: "Silka Medium" }}
        >
          {menuItems.map((item, i) => (
            <div key={item.id} className="px-3 py-2 bg-white rounded-full">
              {item.name}
            </div>
          ))}
        </div>
        <span style={{ fontFamily: "Silka Medium" }}>contact</span>
      </nav>
      <div className="pt-48 px-24">
        <div className="bg-gray-300 grid grid-cols-2">
          <div className="grid grid-cols-2">
            <div className="col-span-2">
              <Card>
                <div className="flex flex-col">
                  <Image
                    width={90}
                    height={90}
                    src="https://rhomadoni.com/wp-content/uploads/2021/12/homescreen1.png"
                    alt="avatar1"
                  ></Image>
                  <span>
                    hello, im dhoni!
                    <br />
                    interested in ui/ux research development
                  </span>
                </div>
              </Card>
            </div>
            <div>card 1</div>
            <div>card 2</div>
            <div className="col-span-2">card 3</div>
            <div className="col-span-2">card 4</div>
          </div>
          <div className="grid grid-cols-2">
            <div>1 span</div>
            <div className="row-span-2">card 1</div>
            <div className="row-span-2">card 2</div>
            <div>1 span</div>
          </div>
        </div>
      </div>
    </main>
  );
}
