import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// Hook to get tracks by uploader (replaces localStorage getUserTracks)
export const useUserTracks = (uploaderFid: number | null) => {
  return useQuery(
    api.tracks.getByUploader, 
    uploaderFid ? { uploaderFid } : "skip"
  );
};

// Hook to get recent tracks for feed (replaces localStorage getFeedTracks)
export const useRecentTracks = (excludeUploaderFid?: number, limit?: number) => {
  return useQuery(api.tracks.getRecent, { 
    limit: limit || 20,
    excludeUploaderFid 
  });
};

// Hook to get popular tracks
export const usePopularTracks = (excludeUploaderFid?: number, limit?: number) => {
  return useQuery(api.tracks.getPopular, { 
    limit: limit || 20,
    excludeUploaderFid 
  });
};

// Hook to get tracks by genre
export const useTracksByGenre = (genre: string | null, limit?: number) => {
  return useQuery(
    api.tracks.getByGenre,
    genre ? { genre, limit: limit || 20 } : "skip"
  );
};

// Hook to search tracks
export const useSearchTracks = (searchTerm: string | null, limit?: number) => {
  return useQuery(
    api.tracks.search,
    searchTerm && searchTerm.length > 2 
      ? { searchTerm, limit: limit || 20 } 
      : "skip"
  );
};

// Hook to get single track by ID
export const useTrack = (trackId: Id<"tracks"> | null) => {
  return useQuery(
    api.tracks.getById,
    trackId ? { trackId } : "skip"
  );
};

// Mutation hooks
export const useCreateTrack = () => {
  return useMutation(api.tracks.create);
};

export const useUpdateTrack = () => {
  return useMutation(api.tracks.updateTrack);
};

export const useDeleteTrack = () => {
  return useMutation(api.tracks.deleteTrack);
};

export const useIncrementPlayCount = () => {
  return useMutation(api.tracks.incrementPlayCount);
};

// Helper hook to check if user has any tracks
export const useHasUserTracks = (uploaderFid: number | null) => {
  const tracks = useUserTracks(uploaderFid);
  return {
    hasTracksLoading: tracks === undefined,
    hasTracks: tracks && tracks.length > 0,
    trackCount: tracks?.length || 0,
  };
};