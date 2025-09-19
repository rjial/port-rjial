import { readdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const LYRICS_DIR = join(process.cwd(), 'data', 'lyrics')

export async function getAllLyricIds(): Promise<string[]> {
  try {
    if (!existsSync(LYRICS_DIR)) {
      return []
    }
    
    const files = await readdir(LYRICS_DIR)
    const lyricIds = files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''))
    
    return lyricIds
  } catch (error) {
    console.error('Error getting lyric IDs:', error)
    return []
  }
}

export async function getLyricData(id: string) {
  try {
    // For server-side rendering, read directly from file system
    if (typeof window === 'undefined') {
      const { readFile } = await import('fs/promises')
      const { join } = await import('path')
      const { existsSync } = await import('fs')
      
      const LYRICS_DIR = join(process.cwd(), 'data', 'lyrics')
      const filePath = join(LYRICS_DIR, `${id}.json`)
      
      if (!existsSync(filePath)) {
        return null
      }
      
      const fileContent = await readFile(filePath, 'utf-8')
      return JSON.parse(fileContent)
    }
    
    // For client-side, use fetch API
    const response = await fetch(`/api/lyrics/${id}`, {
      cache: 'force-cache'
    })
    
    if (!response.ok) {
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching lyric data:', error)
    return null
  }
}