import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Music, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadToLighthouse } from "@/services/lighthouseService";
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth';
import { useCreateTrack } from '@/hooks/useConvexTracks';
import { useEnsureUser } from '@/hooks/useConvexUsers';

interface UploadTrackSimpleProps {
  userAddress: string; // FID as string
}

const GENRES = [
  'Electronic', 'Hip Hop', 'Rock', 'Pop', 'Jazz', 'Classical', 
  'R&B', 'Indie', 'Folk', 'Ambient', 'Experimental', 'Lo-fi',
  'Techno', 'House', 'Dubstep', 'Trap', 'Other'
];

export const UploadTrackSimple = ({ userAddress }: UploadTrackSimpleProps) => {
  const { user } = useFarcasterAuth();
  const createTrack = useCreateTrack();
  const { ensureUserExists } = useEnsureUser(user?.fid || null, user?.verifiedAddresses?.[0]);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [accessType, setAccessType] = useState<'public' | 'encrypted'>('public');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'audio') {
        // Validate audio file type
        if (!file.type.startsWith('audio/')) {
          toast.error("Please select a valid audio file");
          return;
        }
        setAudioFile(file);
      } else {
        // Validate image file type
        if (!file.type.startsWith('image/')) {
          toast.error("Please select a valid image file");
          return;
        }
        setCoverFile(file);
      }
    }
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(Math.round(audio.duration));
      };
      audio.onerror = () => {
        resolve(0); // Default if we can't get duration
      };
      audio.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async () => {
    if (!title || !audioFile || !user) {
      toast.error("Please fill in all required fields and ensure you're signed in");
      return;
    }

    setIsUploading(true);

    try {
      console.log("🎵 Starting track upload process...");
      
      // Ensure user exists in Convex
      await ensureUserExists();
      
      // Get audio duration
      const duration = await getAudioDuration(audioFile);
      console.log(`✅ Audio duration: ${duration} seconds`);

      // Upload audio file to IPFS
      console.log("📤 Uploading audio file to IPFS...");
      const audioUploadResult = await uploadToLighthouse(audioFile);
      const audioCid = audioUploadResult.Hash;
      console.log(`✅ Audio uploaded to IPFS: ${audioCid}`);

      // Upload cover image if provided
      let coverCid = undefined;
      if (coverFile) {
        console.log("🖼️ Uploading cover image to IPFS...");
        const coverUploadResult = await uploadToLighthouse(coverFile);
        coverCid = coverUploadResult.Hash;
        console.log(`✅ Cover uploaded to IPFS: ${coverCid}`);
      }

      // Create track in Convex (metadata stored directly, no IPFS metadata upload)
      console.log("📝 Saving track metadata to Convex...");
      const trackId = await createTrack({
        title: title.trim(),
        artist: user.displayName || user.username,
        uploaderFid: user.fid,
        uploaderUsername: user.username,
        cid: audioCid,
        coverImageCid: coverCid,
        accessRule: {
          type: accessType === 'public' ? 'public' : 'erc20',
          contractAddress: accessType === 'encrypted' ? '0x...' : undefined,
          minBalance: accessType === 'encrypted' ? '1' : undefined,
        },
        duration,
        genre: genre || undefined,
        description: description.trim() || undefined,
        isEncrypted: accessType === 'encrypted',
      });
      console.log(`✅ Track created in Convex: ${trackId}`);

      // Show success message
      toast.success("Track uploaded successfully!", {
        description: `"${title}" is now available in your profile`,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setGenre("");
      setAudioFile(null);
      setCoverFile(null);
      setAccessType('public');

      console.log("🎉 Upload process completed successfully");

    } catch (error) {
      console.error("❌ Upload failed:", error);
      toast.error("Upload failed", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto border-2 border-taco-black">
          <CardContent className="p-8 text-center">
            <Music className="w-16 h-16 text-taco-dark-grey mx-auto mb-4" />
            <h2 className="taco-subheading text-taco-black mb-2">Sign in Required</h2>
            <p className="taco-ui-text text-taco-dark-grey">
              Please sign in with Farcaster to upload tracks.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto border-2 border-taco-black bg-white">
        <CardHeader className="border-b-2 border-taco-black">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-orange-500 to-brand-orange-600 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="taco-subheading text-taco-black">
              Upload Track
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="taco-ui-text font-bold text-taco-black">
                Track Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter track title"
                className="mt-1 border-2 border-taco-black"
                disabled={isUploading}
              />
            </div>

            <div>
              <Label htmlFor="description" className="taco-ui-text font-bold text-taco-black">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about your track..."
                className="mt-1 border-2 border-taco-black"
                disabled={isUploading}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="genre" className="taco-ui-text font-bold text-taco-black">
                Genre
              </Label>
              <Select value={genre} onValueChange={setGenre} disabled={isUploading}>
                <SelectTrigger className="mt-1 border-2 border-taco-black">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Uploads */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="audio" className="taco-ui-text font-bold text-taco-black">
                Audio File *
              </Label>
              <div className="mt-1">
                <Input
                  id="audio"
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileChange(e, 'audio')}
                  className="border-2 border-taco-black py-2 pl-3 pr-3 file:mr-3 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-taco-black file:text-white hover:file:bg-taco-dark-grey file:-ml-3 file:-my-2"
                  disabled={isUploading}
                />
                {audioFile && (
                  <p className="text-sm text-taco-dark-grey mt-1">
                    Selected: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="cover" className="taco-ui-text font-bold text-taco-black">
                Cover Image
              </Label>
              <div className="mt-1">
                <Input
                  id="cover"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'cover')}
                  className="border-2 border-taco-black py-2 pl-3 pr-3 file:mr-3 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-taco-black file:text-white hover:file:bg-taco-dark-grey file:-ml-3 file:-my-2"
                  disabled={isUploading}
                />
                {coverFile && (
                  <p className="text-sm text-taco-dark-grey mt-1">
                    Selected: {coverFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Access Control */}
          <div className="space-y-4">
            <Label className="taco-ui-text font-bold text-taco-black">
              Access Control
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAccessType('public')}
                disabled={isUploading}
                className={`p-4 border-2 text-left transition-all ${
                  accessType === 'public' 
                    ? 'border-brand-orange-500 bg-brand-orange-50' 
                    : 'border-taco-black bg-white hover:bg-taco-light-grey'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Music className="w-5 h-5" />
                  <div>
                    <p className="taco-ui-text font-bold text-taco-black">Public</p>
                    <p className="taco-ui-text text-taco-dark-grey text-sm">Anyone can listen</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAccessType('encrypted')}
                disabled={isUploading}
                className={`p-4 border-2 text-left transition-all ${
                  accessType === 'encrypted' 
                    ? 'border-brand-orange-500 bg-brand-orange-50' 
                    : 'border-taco-black bg-white hover:bg-taco-light-grey'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5" />
                  <div>
                    <p className="taco-ui-text font-bold text-taco-black">Encrypted</p>
                    <p className="taco-ui-text text-taco-dark-grey text-sm">Token-gated access</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!title || !audioFile || isUploading}
            className="w-full taco-button py-4 text-lg bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 hover:from-brand-orange-700 hover:to-brand-orange-800 border-none"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                <span className="taco-ui-text text-white">uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-3" />
                <span className="taco-ui-text text-white">upload track</span>
              </>
            )}
          </Button>

          {/* Info */}
          <div className="bg-taco-light-grey p-4 border-2 border-taco-black">
            <p className="taco-ui-text text-taco-dark-grey text-sm">
              <strong>Note:</strong> Audio files are stored on IPFS for permanent, decentralized access. 
              Track metadata is stored in our database and syncs across all your devices.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};