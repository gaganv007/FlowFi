import { useState, useEffect } from 'react';
import { formatAddress, formatApt } from '../utils/formatters';

export function useAptosWallet() {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('500000000'); // Default demo balance
  const [isLoading, setIsLoading] = useState(false);
  
  // Check wallet connection on load
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.pontem) {
        try {
          const isConnected = await window.pontem.isConnected();
          if (isConnected) {
            const address = await window.pontem.getAccount();
            setConnected(true);
            setAccount({ address });
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };
    
    checkConnection();
  }, []);
  
  // Connect to wallet
  const connectWallet = async () => {
    try {
      setIsLoading(true);
      if (typeof window !== 'undefined' && window.pontem) {
        const response = await window.pontem.connect();
        if (response?.address) {
          setConnected(true);
          setAccount({ address: response.address });
        }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      setIsLoading(true);
      if (typeof window !== 'undefined' && window.pontem) {
        await window.pontem.disconnect();
      }
      setConnected(false);
      setAccount(null);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    account,
    connected,
    isLoading,
    balance,
    formattedBalance: formatApt(balance),
    formattedAddress: account?.address ? formatAddress(account.address) : '',
    connectWallet,
    disconnectWallet,
    formatApt,
    parseApt: (amount) => Math.floor(parseFloat(amount) * 100000000).toString()
  };
}
