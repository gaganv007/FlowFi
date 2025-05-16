import React, { useEffect, useState } from 'react';
import { Button, useToast } from '@chakra-ui/react';

export default function WalletButton() {
  const toast = useToast();
  const [connected, setConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Check if wallet is connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.pontem) {
        try {
          const isConnected = await window.pontem.isConnected();
          setConnected(isConnected);
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };
    
    checkConnection();
  }, []);
  
  const handleConnect = async () => {
    if (typeof window === 'undefined' || !window.pontem) {
      toast({
        title: "Wallet Not Found",
        description: "Please install the Pontem wallet extension",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setIsConnecting(true);
    
    try {
      const response = await window.pontem.connect();
      
      if (response.address) {
        setConnected(true);
        toast({
          title: "Wallet Connected",
          description: `Connected to ${response.address.slice(0, 6)}...${response.address.slice(-4)}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh page to update UI state
        window.location.reload();
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to wallet",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleDisconnect = async () => {
    if (typeof window === 'undefined' || !window.pontem) return;
    
    try {
      await window.pontem.disconnect();
      setConnected(false);
      
      toast({
        title: "Wallet Disconnected",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh page to update UI state
      window.location.reload();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };
  
  return connected ? (
    <Button
      colorScheme="red"
      variant="outline"
      onClick={handleDisconnect}
    >
      Disconnect Wallet
    </Button>
  ) : (
    <Button
      colorScheme="purple"
      onClick={handleConnect}
      isLoading={isConnecting}
      loadingText="Connecting..."
    >
      Connect Wallet
    </Button>
  );
}