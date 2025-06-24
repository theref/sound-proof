
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Music, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadToLighthouse } from "@/services/lighthouseService";
import { encryptAudioFile } from "@/utils/encryption";
import { supabase } from "@/integrations/supabase/client";
import { conditions, initialize } from '@nucypher/taco';
import { ethers } from "ethers";
import { TacoConditionsForm } from "./TacoConditionsForm";
import { toast } from "sonner";

interface UploadTrackProps {
  userAddress: string;
}

export const UploadTrack = ({ userAddress }: UploadTrackProps) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [condition, setCondition] = useState<conditions.condition.Condition | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast: useToastHook } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'audio') {
        setAudioFile(file);
      } else {
        setCoverFile(file);
      }
    }
  };

  const handleUpload = async () => {
    if (!title || !audioFile) {
      useToastHook({
        title: "Missing fields",
        description: "Please fill in the title and select an audio file.",
        variant: "destructive",
      });
      return;
    }

    if (!condition) {
      useToastHook({
        title: "Missing Conditions",
        description: "Please set access conditions",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const toastId = toast.loading(`Uploading ${title}...`, {
        description: "Initializing...",
      });

      console.log('🚀 Starting upload process...');

      await initialize();
      console.log('✅ TACo initialized successfully');
      toast.loading(`Uploading ${title}...`, {
        description: "TACo initialized",
        id: toastId,
      });

      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log('✅ Web3 provider ready');

      const audioBuffer = await audioFile.arrayBuffer();
      console.log('✅ Audio file read, size:', audioBuffer.byteLength / 1024, 'KB');
      
      toast.loading(`Uploading ${title}...`, {
        description: "Encrypting audio...",
        id: toastId,
      });

      const encryptedAudioData = await encryptAudioFile(audioBuffer, condition, web3Provider);
      console.log('✅ Audio encrypted, size:', encryptedAudioData.byteLength / 1024, 'KB');

      toast.loading(`Uploading ${title}...`, {
        description: "Uploading to IPFS...",
        id: toastId,
      });

      // Create a file from the encrypted data
      const encryptedFile = new File([encryptedAudioData], `encrypted_${audioFile.name}`, {
        type: 'application/octet-stream'
      });

      const cid = await uploadToLighthouse(encryptedFile);
      console.log('✅ Upload successful:', cid);

      toast.loading(`Uploading ${title}...`, {
        description: "Saving metadata...",
        id: toastId,
      });

      // Save metadata to Supabase
      const { data, error } = await supabase
        .from('tracks')
        .insert({
          title,
          uploader: userAddress,
          cid,
          access_rule: {
            type: 'erc20', // Default to erc20 for now
            contractAddress: '0x46abDF5aD1726ba700794539C3dB8fE591854729', // Default contract
            minBalance: '1' // Default min balance
          },
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving track metadata:', error);
        throw error;
      }
      
      console.log('✅ Track metadata saved successfully');
      
      toast.success(`${title} uploaded successfully`, {
        id: toastId,
      });
      
      // Reset form
      setTitle("");
      setAudioFile(null);
      setCoverFile(null);
      setCondition(null);
      
      // Redirect to the song page
      navigate(`/song/${data.id}`);
      
    } catch (error) {
      console.error("❌ Upload error:", error);
      toast.error(`Failed to upload ${title}`, {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="taco-headline mb-4">
          Upload Your Track
        </h1>
        <p className="taco-body text-taco-dark-grey">
          Share your music with the world using decentralized encryption
        </p>
      </div>

      <Card className="border-2 border-taco-black bg-white">
        <CardHeader className="border-b-2 border-taco-black">
          <CardTitle className="taco-subheading text-taco-black flex items-center gap-3">
            <div className="w-12 h-12 bg-taco-black rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            Track Details
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="taco-ui-text text-taco-black">Track Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your track title"
              className="border-2 border-taco-black bg-white text-taco-black placeholder:text-taco-dark-grey focus:border-taco-neon taco-ui-text"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="taco-ui-text text-taco-black">Audio File</Label>
            <div className="border-2 border-dashed border-taco-black rounded-lg p-6 text-center hover:border-taco-neon transition-colors bg-taco-light-grey">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => handleFileChange(e, 'audio')}
                className="hidden"
                id="audio-upload"
              />
              <label htmlFor="audio-upload" className="cursor-pointer">
                <Music className="w-8 h-8 mx-auto mb-2 text-taco-black" />
                <p className="taco-ui-text text-taco-black font-bold">
                  {audioFile ? audioFile.name : "Click to select audio file"}
                </p>
                <p className="taco-ui-text text-taco-dark-grey text-sm mt-1">
                  Supports MP3, WAV, FLAC and other audio formats
                </p>
              </label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="taco-ui-text text-taco-black">Cover Art (Optional)</Label>
            <div className="border-2 border-dashed border-taco-black rounded-lg p-6 text-center hover:border-taco-neon transition-colors bg-taco-light-grey">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'cover')}
                className="hidden"
                id="cover-upload"
              />
              <label htmlFor="cover-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-taco-black" />
                <p className="taco-ui-text text-taco-black font-bold">
                  {coverFile ? coverFile.name : "Click to select cover image"}
                </p>
                <p className="taco-ui-text text-taco-dark-grey text-sm mt-1">
                  Supports JPG, PNG and other image formats
                </p>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-taco-black bg-white">
        <CardHeader className="border-b-2 border-taco-black">
          <CardTitle className="taco-subheading text-taco-black flex items-center gap-3">
            <div className="w-12 h-12 bg-taco-black rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            Access Control
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <p className="taco-ui-text text-taco-dark-grey">
            Configure who can access your encrypted track
          </p>
          
          <TacoConditionsForm
            onChange={setCondition}
            disabled={isUploading}
          />
        </CardContent>
      </Card>
      
      <Button 
        onClick={handleUpload}
        disabled={isUploading || !condition}
        className="w-full taco-button py-6 text-lg"
      >
        {isUploading ? (
          <>
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-3" />
            <span className="taco-ui-text">ENCRYPTING & UPLOADING...</span>
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 mr-3" />
            <span className="taco-ui-text">UPLOAD TRACK</span>
          </>
        )}
      </Button>
    </div>
  );
};
