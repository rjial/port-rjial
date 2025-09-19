import Link from 'next/link'
import Image from 'next/image'
import { getAllGuides } from '@/lib/guides'

export default async function Home() {
  const guides = await getAllGuides()

  return (
    <main className="">
      <div className="flex justify-between items-center p-4 border-b border-gray-700 m-10">
        <h1 className="text-xl font-bold">Youtube Chantmix Guide</h1>
        <div className="text-sm text-gray-400">
          {guides.length} guide{guides.length !== 1 ? 's' : ''} available
        </div>
      </div>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-10">
          {guides.length > 0 ? (
            guides.map((guide) => (
              <Link 
                key={guide.id} 
                href={`/chant/${guide.id}`}
                className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 bg-gray-800 hover:bg-gray-700 block"
              >
                <div className="relative w-full h-48">
                  <Image
                    src={guide.thumbnailUrl}
                    alt={`${guide.title} thumbnail`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {guide.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-1">
                    Artist: {guide.author}
                  </p>
                  <div className="flex justify-between items-center text-xs">
                    <p className="text-gray-500">
                      Duration: {guide.duration || 'Unknown'}
                    </p>
                    <p className="text-primary">
                      {guide.lyricCount} lyric{guide.lyricCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {guide.lastLyricTime && (
                    <div className="mt-1 text-xs text-gray-600">
                      Last lyric: {Math.floor(guide.lastLyricTime / 60000)}:{Math.floor((guide.lastLyricTime % 60000) / 1000).toString().padStart(2, '0')}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-600 font-mono">
                    ID: {guide.youtubeId}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-xl text-white mb-2">No guides available</h3>
              <p className="text-gray-400">Create your first chantmix guide to get started!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
