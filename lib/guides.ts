import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

export interface GuideData {
  title: string
  author: string
  youtubeId: string
  lyrics: Array<{
    time: number
    text: string
  }>
}

export interface GuideWithMetadata extends GuideData {
  id: string
  duration: string | null
  lyricCount: number
  thumbnailUrl: string
  lastLyricTime: number | null
}

function calculateDurationFromLyrics(lyrics: Array<{time: number, text: string}>): { duration: string | null, lastLyricTime: number | null } {
  if (lyrics.length === 0) {
    return { duration: null, lastLyricTime: null }
  }
  
  // Get the last lyric time
  const lastLyric = lyrics[lyrics.length - 1]
  const lastLyricTime = lastLyric.time
  
  // Estimate duration by adding ~10 seconds to the last lyric time for completion
  const estimatedEndTime = lastLyricTime + 10000 // Add 10 seconds in milliseconds
  
  const minutes = Math.floor(estimatedEndTime / 60000)
  const seconds = Math.floor((estimatedEndTime % 60000) / 1000)
  
  return {
    duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
    lastLyricTime
  }
}

// Server-side version for SSG
export async function getAllGuides(): Promise<GuideWithMetadata[]> {
  const lyricsDir = join(process.cwd(), 'public', 'data', 'lyrics')
  
  try {
    const files = readdirSync(lyricsDir).filter(file => file.endsWith('.json'))
    
    const guides: GuideWithMetadata[] = []
    
    for (const file of files) {
      const id = file.replace('.json', '')
      
      // Skip invalid entries
      if (id === 'undefined' || !id) continue
      
      try {
        const filePath = join(lyricsDir, file)
        const fileContent = readFileSync(filePath, 'utf8')
        const guideData: GuideData = JSON.parse(fileContent)
        
        // Skip entries with placeholder titles
        if (!guideData.title || guideData.title === `Song ${id}`) {
          continue
        }
        
        const { duration, lastLyricTime } = calculateDurationFromLyrics(guideData.lyrics)

        guides.push({
          ...guideData,
          id,
          duration,
          lastLyricTime,
          lyricCount: guideData.lyrics.length,
          thumbnailUrl: `https://img.youtube.com/vi/${guideData.youtubeId}/hqdefault.jpg`
        })
      } catch (error) {
        console.error(`Error reading guide ${id}:`, error)
        continue
      }
    }
    
    // Sort by title
    return guides.sort((a, b) => a.title.localeCompare(b.title))
  } catch (error) {
    console.error('Error reading guides directory:', error)
    return []
  }
}