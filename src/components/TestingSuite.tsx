import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Play,
  Upload,
  User,
  Database,
  Wifi,
  Settings
} from "lucide-react";
import { toast } from "sonner";

// Import testing utilities
import { getFarcasterClient } from "@/integrations/farcaster/client";
import { ConvexTest } from "./ConvexTest";
import { uploadToLighthouse, checkFileExists } from "@/services/lighthouseService";
import { storage, trackStorage, userStorage } from "@/utils/localStorage";
import { useFarcasterAuth } from "@/hooks/useFarcasterAuth";

type TestStatus = 'idle' | 'running' | 'passed' | 'failed';

interface TestResult {
  name: string;
  status: TestStatus;
  message?: string;
  details?: any;
}

export const TestingSuite = () => {
  const { user, isConnected } = useFarcasterAuth();
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (testName: string, status: TestStatus, message?: string, details?: any) => {
    setResults(prev => ({
      ...prev,
      [testName]: { name: testName, status, message, details }
    }));
  };

  // Environment Tests
  const testEnvironment = async () => {
    updateTest('env-neynar', 'running', 'Checking Neynar API key...');
    
    try {
      const neynarKey = import.meta.env.VITE_NEYNAR_API_KEY;
      if (!neynarKey) {
        updateTest('env-neynar', 'failed', 'VITE_NEYNAR_API_KEY not found');
        return;
      }
      updateTest('env-neynar', 'passed', `API key found: ${neynarKey.slice(0, 8)}...`);
    } catch (error) {
      updateTest('env-neynar', 'failed', 'Environment variable check failed');
    }

    updateTest('env-lighthouse', 'running', 'Checking Lighthouse API key...');
    
    try {
      const lighthouseKey = import.meta.env.VITE_LIGHTHOUSE_API_KEY;
      if (!lighthouseKey) {
        updateTest('env-lighthouse', 'failed', 'VITE_LIGHTHOUSE_API_KEY not found');
        return;
      }
      updateTest('env-lighthouse', 'passed', `API key found: ${lighthouseKey.slice(0, 8)}...`);
    } catch (error) {
      updateTest('env-lighthouse', 'failed', 'Environment variable check failed');
    }
  };

  // Farcaster API Tests
  const testFarcasterAPI = async () => {
    updateTest('farcaster-client', 'running', 'Initializing Farcaster client...');
    
    try {
      const client = getFarcasterClient();
      updateTest('farcaster-client', 'passed', 'Client initialized successfully');

      updateTest('farcaster-health', 'running', 'Testing API connection...');
      const isHealthy = await client.healthCheck();
      
      if (isHealthy) {
        updateTest('farcaster-health', 'passed', 'API connection healthy');
        
        // Test user lookup
        updateTest('farcaster-lookup', 'running', 'Testing user lookup...');
        const testUser = await client.getUserByUsername('dwr.eth');
        
        if (testUser) {
          updateTest('farcaster-lookup', 'passed', `Found user: ${testUser.displayName} (fid: ${testUser.fid})`, testUser);
        } else {
          updateTest('farcaster-lookup', 'failed', 'Could not find test user');
        }
      } else {
        updateTest('farcaster-health', 'failed', 'API health check failed');
      }
    } catch (error) {
      updateTest('farcaster-client', 'failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // Storage Tests
  const testLocalStorage = async () => {
    updateTest('storage-access', 'running', 'Testing localStorage access...');
    
    try {
      const testKey = 'soundproof_test';
      const testData = { test: true, timestamp: Date.now() };
      
      localStorage.setItem(testKey, JSON.stringify(testData));
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (retrieved && JSON.parse(retrieved).test === true) {
        updateTest('storage-access', 'passed', 'localStorage read/write working');
      } else {
        updateTest('storage-access', 'failed', 'localStorage data mismatch');
      }
    } catch (error) {
      updateTest('storage-access', 'failed', 'localStorage access failed');
    }

    updateTest('storage-utils', 'running', 'Testing storage utilities...');
    
    try {
      const storageInfo = storage.getStorageInfo();
      updateTest('storage-utils', 'passed', 'Storage utilities working', storageInfo);
    } catch (error) {
      updateTest('storage-utils', 'failed', 'Storage utilities failed');
    }
  };

  // IPFS Tests
  const testIPFS = async () => {
    updateTest('ipfs-upload', 'running', 'Testing IPFS upload...');
    
    try {
      const testFile = new File(['Hello SoundProof!'], 'test.txt', { type: 'text/plain' });
      const result = await uploadToLighthouse(testFile);
      
      if (result.Hash) {
        updateTest('ipfs-upload', 'passed', `Upload successful: ${result.Hash}`, result);
        
        // Test file retrieval
        updateTest('ipfs-retrieval', 'running', 'Testing file retrieval...');
        const exists = await checkFileExists(result.Hash);
        
        if (exists) {
          updateTest('ipfs-retrieval', 'passed', 'File accessible via IPFS gateway');
        } else {
          updateTest('ipfs-retrieval', 'failed', 'File not accessible via gateway');
        }
      } else {
        updateTest('ipfs-upload', 'failed', 'Upload returned no hash');
      }
    } catch (error) {
      updateTest('ipfs-upload', 'failed', error instanceof Error ? error.message : 'Upload failed');
    }
  };

  // Authentication Tests
  const testAuth = async () => {
    updateTest('auth-state', 'running', 'Checking auth state...');
    
    if (isConnected && user) {
      updateTest('auth-state', 'passed', `Signed in as @${user.username}`, {
        fid: user.fid,
        displayName: user.displayName,
        verifications: user.verifications.length
      });
      
      updateTest('auth-storage', 'running', 'Checking stored user data...');
      const storedUser = userStorage.get();
      
      if (storedUser && storedUser.fid === user.fid) {
        updateTest('auth-storage', 'passed', 'User data stored correctly');
      } else {
        updateTest('auth-storage', 'failed', 'User data storage mismatch');
      }
    } else {
      updateTest('auth-state', 'failed', 'Not authenticated - Click "sign in with farcaster" on main page first');
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    setResults({});
    
    try {
      await testEnvironment();
      await testLocalStorage();
      await testFarcasterAPI();
      await testIPFS();
      await testAuth();
      
      toast.success("All tests completed!");
    } catch (error) {
      toast.error("Test suite encountered an error");
    } finally {
      setIsRunning(false);
    }
  };

  const clearStorage = () => {
    storage.clear();
    toast.success("All localStorage cleared");
    setResults({});
  };

  const exportData = () => {
    const data = storage.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `soundproof-debug-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Debug data exported");
  };

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-brand-orange-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'running': return <AlertCircle className="w-4 h-4 text-yellow-600 animate-pulse" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestStatus) => {
    const variants = {
      passed: 'default',
      failed: 'destructive', 
      running: 'secondary',
      idle: 'outline'
    };
    
    return (
      <Badge variant={variants[status] as any} className="ml-2">
        {status}
      </Badge>
    );
  };

  const testCategories = [
    {
      id: 'environment',
      name: 'Environment',
      icon: <Settings className="w-4 h-4" />,
      tests: ['env-neynar', 'env-lighthouse']
    },
    {
      id: 'storage',
      name: 'Storage',
      icon: <Database className="w-4 h-4" />,
      tests: ['storage-access', 'storage-utils']
    },
    {
      id: 'apis',
      name: 'External APIs',
      icon: <Wifi className="w-4 h-4" />,
      tests: ['farcaster-client', 'farcaster-health', 'farcaster-lookup', 'ipfs-upload', 'ipfs-retrieval']
    },
    {
      id: 'auth',
      name: 'Authentication',
      icon: <User className="w-4 h-4" />,
      tests: ['auth-state', 'auth-storage']
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="border-2 border-taco-black">
        <CardHeader className="border-b-2 border-taco-black">
          <CardTitle className="taco-subheading text-taco-black flex items-center gap-2">
            <Play className="w-6 h-6" />
            SoundProof Testing Suite
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          {/* Control Panel */}
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="taco-button bg-brand-orange-500 hover:bg-brand-orange-600"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            <Button variant="outline" onClick={exportData} className="border-2 border-taco-black">
              Export Debug Data
            </Button>
            <Button variant="outline" onClick={clearStorage} className="border-2 border-taco-black text-red-600">
              Clear Storage
            </Button>
          </div>

          {/* Test Results */}
          <Tabs defaultValue="environment" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {testCategories.map(category => (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                  {category.icon}
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {testCategories.map(category => (
              <TabsContent key={category.id} value={category.id} className="mt-6">
                <div className="space-y-3">
                  {category.tests.map(testName => {
                    const result = results[testName];
                    
                    return (
                      <Card key={testName} className="border-2 border-taco-black">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(result?.status || 'idle')}
                              <span className="font-bold">{testName}</span>
                              {getStatusBadge(result?.status || 'idle')}
                            </div>
                          </div>
                          
                          {result?.message && (
                            <p className="text-sm text-taco-dark-grey mb-2">
                              {result.message}
                            </p>
                          )}
                          
                          {result?.details && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-taco-dark-grey hover:text-taco-black">
                                View Details
                              </summary>
                              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                                {JSON.stringify(result.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* System Info */}
          <Card className="mt-6 border-2 border-taco-black">
            <CardHeader>
              <CardTitle className="text-lg">System Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div><strong>User Agent:</strong> {navigator.userAgent}</div>
              <div><strong>localStorage Quota:</strong> {navigator.storage ? 'Available' : 'Not supported'}</div>
              <div><strong>Current URL:</strong> {window.location.href}</div>
              <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
              {user && (
                <div><strong>Authenticated User:</strong> @{user.username} (fid: {user.fid})</div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};