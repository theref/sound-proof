import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple in-memory storage for MVP (will be replaced with Vercel KV)
const users = new Map();
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
        // Get user data
        const user = users.get(fid);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(user);
        
      case 'POST':
      case 'PUT':
        // Save/update user data
        const userData = req.body;
        if (!userData) {
          return res.status(400).json({ error: 'User data is required' });
        }
        
        users.set(fid, {
          ...userData,
          fid,
          updatedAt: new Date().toISOString()
        });
        
        return res.status(200).json({ success: true, fid });
        
      case 'DELETE':
        // Delete user data
        users.delete(fid);
        tracks.delete(fid);
        return res.status(200).json({ success: true });
        
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}