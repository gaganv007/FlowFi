import { useState, useEffect } from 'react';
import { Box, Container, SimpleGrid, VStack, Heading, Text, Button, Image, Flex } from '@chakra-ui/react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CreateStream } from '../components/CreateStream';
import { StreamList } from '../components/StreamList';
import { getStreamsForAccount } from '../services/streamService';
import { useAptosWallet } from '../hooks/useAptosWallet';

export default function Home() {
  const [streams, setStreams] = useState([]);
  const { connected, account, connectWallet } = useAptosWallet();
  
  // Fetch streams when wallet is connected
  useEffect(() => {
    if (connected && account) {
      fetchStreams(account.address);
    }
  }, [connected, account]);
  
  // Fetch streams
  const fetchStreams = async (address) => {
    if (!address) return;
    
    try {
      const accountStreams = await getStreamsForAccount(address);
      setStreams(accountStreams);
    } catch (error) {
      console.error('Error fetching streams:', error);
    }
  };
  
  // Filter streams
  const incomingStreams = streams.filter(s => s.recipient === account?.address);
  const outgoingStreams = streams.filter(s => s.sender === account?.address);
  
  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      
      <Container maxW="container.xl" py={8}>
        {connected ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <CreateStream />
            <StreamList
              incomingStreams={incomingStreams}
              outgoingStreams={outgoingStreams}
            />
          </SimpleGrid>
        ) : (
          <VStack 
            spacing={6}
            bg="white"
            p={10}
            borderRadius="xl"
            boxShadow="xl"
            textAlign="center"
            mt={10}
          >
            <Image 
              src="/images/flowfi-logo.png" 
              alt="FlowFi Logo" 
              height="100px" 
              mb={4} 
            />
            
            <Heading size="lg" color="purple.600">
              Welcome to FlowFi
            </Heading>
            <Text fontSize="xl" maxW="600px">
              A decentralized protocol for real-time value streaming on Aptos.
            </Text>
            <Text color="gray.600" maxW="600px">
              Connect your wallet to start creating payment streams that transfer funds continuously in real-time.
            </Text>
            
            <Button 
              colorScheme="purple" 
              size="lg" 
              onClick={connectWallet}
              mt={4}
            >
              Connect Wallet
            </Button>
          </VStack>
        )}
      </Container>
      
      <Footer />
    </Box>
  );
}
