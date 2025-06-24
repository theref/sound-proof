
import { conditions, encrypt, domains, initialize } from '@nucypher/taco';
import { EIP4361AuthProvider, USER_ADDRESS_PARAM_DEFAULT } from '@nucypher/taco-auth';
import { ethers } from 'ethers';

export async function encryptAudioFile(
  audioBuffer: ArrayBuffer,
  condition: conditions.condition.Condition,
  web3Provider: ethers.providers.Web3Provider
) {
  console.log('🔒 Starting encryption with TACo...');
  
  // Initialize TACo first
  await initialize();
  console.log('✅ TACo initialized for encryption');
  
  // Use Amoy testnet provider for RPC access
  const amoyProvider = new ethers.providers.JsonRpcProvider(
    'https://rpc-amoy.polygon.technology',
    {
      name: 'amoy',
      chainId: 80002,
    }
  );

  // Get signer from the connected wallet
  const signer = web3Provider.getSigner();

  console.log('Encryption parameters:', {
    domain: domains.DEVNET,
    conditionType: condition.constructor.name,
    ritualsToTry: 27,
    network: await amoyProvider.getNetwork(),
    signerAddress: await signer.getAddress()
  });
  
  try {
    const encryptedData = await encrypt(
      amoyProvider,
      domains.DEVNET,
      new Uint8Array(audioBuffer),
      condition,
      27,
      signer
    );
    
    // Convert ThresholdMessageKit to binary format
    const serializedData = encryptedData.toBytes();
    console.log('✅ Encryption successful, encrypted size:', serializedData.byteLength, 'bytes');
    return serializedData;
  } catch (error) {
    console.error('❌ Encryption failed:', error);
    console.error('Encryption error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw new Error(`Encryption failed: ${error.message}`);
  }
}
