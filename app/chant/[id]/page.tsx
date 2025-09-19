import { getAllLyricIds, getLyricData } from '@/lib/lyrics'
import ChantClientComponent from './ChantClientComponent'

// Generate static params for all available lyric IDs
export async function generateStaticParams() {
  const lyricIds = await getAllLyricIds()
  
  return lyricIds.map((id) => ({
    id: id,
  }))
}

// Server-side data fetching
export default async function ChantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const serverData = await getLyricData(id)
  
  return (
    <ChantClientComponent 
      params={{ id }}
      initialData={serverData}
    />
  )
}
