
const IPFS_GATEWAY = 'https://gateway.lighthouse.storage/ipfs';

// Direct Lighthouse API upload (requires API key)
export const uploadToLighthouse = async (file: File): Promise<{ Hash: string }> => {
  try {
    console.log('Uploading file to Lighthouse directly:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);

    // Get API key from environment
    const apiKey = import.meta.env.VITE_LIGHTHOUSE_API_KEY || import.meta.env.LIGHTHOUSE_API_KEY;
    if (!apiKey) {
      throw new Error('Lighthouse API key not found. Please set VITE_LIGHTHOUSE_API_KEY environment variable.');
    }

    const response = await fetch('https://node.lighthouse.storage/api/v0/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lighthouse API error:', errorText);
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data || !data.Hash) {
      console.error('Unexpected response structure:', data);
      throw new Error('Invalid response structure from Lighthouse API');
    }

    console.log('Upload successful, hash:', data.Hash);
    return { Hash: data.Hash };
  } catch (error) {
    console.error('Lighthouse upload failed:', error);
    throw error instanceof Error ? error : new Error('Failed to upload file to Lighthouse');
  }
};

export const getFileFromLighthouse = (cid: string): string => {
  const url = `${IPFS_GATEWAY}/${cid}`;
  console.log('Generated audio URL:', url);
  return url;
};

export const fetchAudioFile = async (cid: string): Promise<string> => {
  // Return the IPFS gateway URL
  return getFileFromLighthouse(cid);
};

// Helper function to check if file exists on IPFS
export const checkFileExists = async (cid: string): Promise<boolean> => {
  try {
    const response = await fetch(getFileFromLighthouse(cid), { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};
