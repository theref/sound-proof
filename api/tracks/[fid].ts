import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple in-memory storage for MVP (will be replaced with Vercel KV)
const tracks = new Map();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { fid } = req.query;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (!fid || typeof fid !== 'string') {
    return res.status(400).json({ error: 'FID is required' });
  }
  
  try {
    switch (req.method) {
      case 'GET':
        // Get user's tracks
        const userTracks = tracks.get(fid) || [];
        return res.status(200).json({ tracks: userTracks });
        
      case 'POST':
        // Add new track
        const newTrack = req.body;
        if (!newTrack || !newTrack.id) {
          return res.status(400).json({ error: 'Track data with ID is required' });
        }
        
        const existingTracks = tracks.get(fid) || [];
        existingTracks.push({
          ...newTrack,
          uploadedAt: new Date().toISOString()
        });
        tracks.set(fid, existingTracks);
        
        return res.status(200).json({ success: true, trackId: newTrack.id });
        
      case 'PUT':
        // Update existing track
        const { trackId, ...trackData } = req.body;
        if (!trackId) {
          return res.status(400).json({ error: 'Track ID is required' });
        }
        
        const userTracksForUpdate = tracks.get(fid) || [];
        const trackIndex = userTracksForUpdate.findIndex((t: any) => t.id === trackId);
        
        if (trackIndex === -1) {
          return res.status(404).json({ error: 'Track not found' });
        }
        
        userTracksForUpdate[trackIndex] = {
          ...userTracksForUpdate[trackIndex],
          ...trackData,
          updatedAt: new Date().toISOString()
        };
        
        tracks.set(fid, userTracksForUpdate);
        return res.status(200).json({ success: true, trackId });
        
      case 'DELETE':
        // Delete track
        const { trackId: deleteTrackId } = req.body;
        if (!deleteTrackId) {
          return res.status(400).json({ error: 'Track ID is required' });
        }
        
        const userTracksForDelete = tracks.get(fid) || [];
        const filteredTracks = userTracksForDelete.filter((t: any) => t.id !== deleteTrackId);
        tracks.set(fid, filteredTracks);
        
        return res.status(200).json({ success: true });
        
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Tracks API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}