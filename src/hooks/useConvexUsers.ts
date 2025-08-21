import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

// Hook to get user by FID
export const useUserByFid = (fid: number | null) => {
  return useQuery(
    api.users.getByFid,
    fid ? { fid } : "skip"
  );
};

// Hook to get user by wallet address  
export const useUserByWallet = (walletAddress: string | null) => {
  return useQuery(
    api.users.getByWallet,
    walletAddress ? { walletAddress } : "skip"
  );
};

// Mutation hooks
export const useCreateOrUpdateUser = () => {
  return useMutation(api.users.createOrUpdate);
};

export const useUpdateLastActive = () => {
  return useMutation(api.users.updateLastActive);
};

// Combined hook for user management (creates user if doesn't exist)
export const useEnsureUser = (fid: number | null, walletAddress?: string | null) => {
  const user = useUserByFid(fid);
  const createOrUpdateUser = useCreateOrUpdateUser();
  const updateLastActive = useUpdateLastActive();

  const ensureUserExists = async () => {
    if (!fid) return null;
    
    try {
      // Create or update user
      const userId = await createOrUpdateUser({ 
        fid, 
        walletAddress: walletAddress || undefined 
      });
      
      return userId;
    } catch (error) {
      console.error("Failed to ensure user exists:", error);
      throw error;
    }
  };

  const updateActivity = async () => {
    if (!fid) return;
    
    try {
      await updateLastActive({ fid });
    } catch (error) {
      console.error("Failed to update user activity:", error);
    }
  };

  return {
    user,
    userLoading: user === undefined,
    userExists: !!user,
    ensureUserExists,
    updateActivity,
  };
};