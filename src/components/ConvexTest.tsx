import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const ConvexTest = () => {
  // Test basic queries
  const recentTracks = useQuery(api.tracks.getRecent, { limit: 5 });
  const allUsers = useQuery(api.users.list, { limit: 10 });
  
  const isConvexWorking = import.meta.env.VITE_CONVEX_URL && 
                          !import.meta.env.VITE_CONVEX_URL.includes("placeholder");
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Convex Status 
          <Badge variant={isConvexWorking ? "default" : "secondary"}>
            {isConvexWorking ? "Connected" : "Not Configured"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Development status of Convex integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Configuration</h4>
          <div className="text-sm space-y-1">
            <p>Convex URL: {import.meta.env.VITE_CONVEX_URL || "Not set"}</p>
            <p>Types Generated: {recentTracks !== undefined ? "✅ Yes" : "⏳ Loading..."}</p>
          </div>
        </div>
        
        {isConvexWorking ? (
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold mb-2">Recent Tracks Query</h4>
              {recentTracks === undefined ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : (
                <p className="text-sm">
                  {recentTracks.length === 0 
                    ? "No tracks found (empty database)" 
                    : `Found ${recentTracks.length} tracks`}
                </p>
              )}
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Users Query</h4>
              {allUsers === undefined ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : (
                <p className="text-sm">
                  {allUsers.length === 0 
                    ? "No users found (empty database)" 
                    : `Found ${allUsers.length} users`}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Setup Required</h4>
            <div className="text-sm text-yellow-700 space-y-2">
              <p>To use Convex:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Run <code className="bg-yellow-100 px-1 rounded">npx convex dev</code></li>
                <li>Follow the setup prompts</li>
                <li>Add your deployment URL to <code className="bg-yellow-100 px-1 rounded">.env.local</code></li>
                <li>Restart the dev server</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};