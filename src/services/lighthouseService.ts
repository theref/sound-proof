
import { supabase } from '@/integrations/supabase/client';

const IPFS_GATEWAY = 'https://gateway.lighthouse.storage/ipfs';

export const uploadToLighthouse = async (file: File): Promise<string> => {
  try {
    console.log('Uploading file to Lighthouse via edge function:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);

    const { data, error } = await supabase.functions.invoke('lighthouse-upload', {
      body: formData,
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    if (!data || !data.hash) {
      console.error('Unexpected response structure:', data);
      throw new Error('Invalid response structure from upload service');
    }

    console.log('Upload successful, hash:', data.hash);
    return data.hash;
  } catch (error) {
    console.error('Lighthouse upload failed:', error);
    throw new Error('Failed to upload file to Lighthouse');
  }
};

export const getFileFromLighthouse = (cid: string): string => {
  const url = `${IPFS_GATEWAY}/${cid}`;
  console.log('Generated audio URL:', url);
  return url;
};

export const fetchAudioFile = async (cid: string): Promise<string> => {
  // For now, just return the IPFS gateway URL
  // TODO: Implement proper TACo decryption when needed
  return getFileFromLighthouse(cid);
};
