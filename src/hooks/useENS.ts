
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface ENSCache {
  [address: string]: string | null;
}

export const useENS = (address: string) => {
  const [ensName, setEnsName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const cache: ENSCache = JSON.parse(localStorage.getItem('ensCache') || '{}');
    
    // Check cache first
    if (cache[address] !== undefined) {
      setEnsName(cache[address]);
      return;
    }

    const lookupENS = async () => {
      if (!address || !window.ethereum) return;
      
      setIsLoading(true);
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const name = await provider.lookupAddress(address);
        
        // Update cache
        cache[address] = name;
        localStorage.setItem('ensCache', JSON.stringify(cache));
        
        setEnsName(name);
      } catch (error) {
        console.log('ENS lookup failed for', address);
        // Cache null result to avoid repeated lookups
        cache[address] = null;
        localStorage.setItem('ensCache', JSON.stringify(cache));
        setEnsName(null);
      } finally {
        setIsLoading(false);
      }
    };

    lookupENS();
  }, [address]);

  return { ensName, isLoading };
};
