import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

interface Lyric {
  time: number
  text: string
}

interface SongData {
  title: string
  author: string
  youtubeId: string
  lyrics: Lyric[]
}

const LYRICS_DIR = join(process.cwd(), 'data', 'lyrics')

// Ensure lyrics directory exists
async function ensureLyricsDir() {
  if (!existsSync(LYRICS_DIR)) {
    await mkdir(LYRICS_DIR, { recursive: true })
  }
}

// GET - Retrieve lyric data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await ensureLyricsDir()
    const filePath = join(LYRICS_DIR, `${id}.json`)
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'Lyrics not found' }, { status: 404 })
    }

    const fileContent = await readFile(filePath, 'utf-8')
    const songData: SongData = JSON.parse(fileContent)
    
    return NextResponse.json(songData)
  } catch (error) {
    console.error('Error reading lyrics:', error)
    return NextResponse.json({ error: 'Failed to read lyrics' }, { status: 500 })
  }
}

// POST - Store lyric data
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const songData: SongData = await request.json()
    
    // Validate the data structure
    if (!songData.title || !songData.author || !songData.youtubeId || !Array.isArray(songData.lyrics)) {
      return NextResponse.json({ error: 'Invalid song data structure' }, { status: 400 })
    }

    // Ensure the youtubeId matches the URL parameter
    songData.youtubeId = id

    await ensureLyricsDir()
    const filePath = join(LYRICS_DIR, `${id}.json`)
    
    await writeFile(filePath, JSON.stringify(songData, null, 2), 'utf-8')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Lyrics saved successfully',
      id: id 
    })
  } catch (error) {
    console.error('Error saving lyrics:', error)
    return NextResponse.json({ error: 'Failed to save lyrics' }, { status: 500 })
  }
}

// PUT - Update existing lyric data
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return POST(request, { params })
}

// DELETE - Remove lyric data
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await ensureLyricsDir()
    const filePath = join(LYRICS_DIR, `${id}.json`)
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'Lyrics not found' }, { status: 404 })
    }

    // Remove the file (you might want to implement soft delete instead)
    const { unlink } = await import('fs/promises')
    await unlink(filePath)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Lyrics deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting lyrics:', error)
    return NextResponse.json({ error: 'Failed to delete lyrics' }, { status: 500 })
  }
}