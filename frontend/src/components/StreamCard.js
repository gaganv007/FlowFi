import { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Progress,
  Badge,
  HStack,
  useToast
} from '@chakra-ui/react';
import { formatApt, formatDate } from '../utils/formatters';

export const StreamCard = ({ stream, isRecipient }) => {
  const toast = useToast();
  
  const [progress, setProgress] = useState(0);
  const [available, setAvailable] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculate and update progress
  useEffect(() => {
    const updateProgress = () => {
      const now = Math.floor(Date.now() / 1000);
      
      if (now < stream.startTime) {
        setProgress(0);
        setAvailable(0);
        return;
      }
      
      if (now >= stream.endTime) {
        setProgress(100);
        const remaining = parseInt(stream.amount) - parseInt(stream.withdrawnAmount || 0);
        setAvailable(remaining);
        return;
      }
      
      // Calculate progress percentage
      const totalDuration = stream.endTime - stream.startTime;
      const elapsed = now - stream.startTime;
      const progressValue = Math.floor((elapsed / totalDuration) * 100);
      
      // Calculate available amount
      const streamedAmount = Math.floor((parseInt(stream.amount) * elapsed) / totalDuration);
      const withdrawnAmount = parseInt(stream.withdrawnAmount || 0);
      const availableAmount = Math.max(0, streamedAmount - withdrawnAmount);
      
      setProgress(progressValue);
      setAvailable(availableAmount);
    };
    
    // Run immediately
    updateProgress();
    
    // Set up interval for active streams
    if (stream.status === 'active') {
      const interval = setInterval(updateProgress, 1000);
      return () => clearInterval(interval);
    }
  }, [stream]);
  
  const handleAction = async () => {
    setIsLoading(true);
    
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: isRecipient ? "Funds Withdrawn" : "Stream Cancelled",
        description: "Transaction complete!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh page to show updated state
      window.location.reload();
    } catch (error) {
      console.error('Action error:', error);
      toast({
        title: "Transaction Failed",
        description: error.message || "An unexpected error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="sm"
      bg="white"
    >
      <Flex justify="space-between" align="center" p={4} bg="gray.50">
        <Text fontWeight="bold">Stream #{stream.id}</Text>
        <Badge colorScheme={stream.status === 'active' ? 'green' : 'gray'}>
          {stream.status.toUpperCase()}
        </Badge>
      </Flex>
      
      <Box p={4}>
        <Flex justify="space-between" mb={2}>
          <Text fontSize="sm" color="gray.600">
            {isRecipient ? 'From:' : 'To:'}
          </Text>
          <Text fontSize="sm" fontFamily="mono">
            {isRecipient
              ? stream.sender.slice(0, 6) + '...' + stream.sender.slice(-4)
              : stream.recipient.slice(0, 6) + '...' + stream.recipient.slice(-4)}
          </Text>
        </Flex>
        
        <HStack justify="space-between" mb={2}>
          <Text fontSize="sm" color="gray.600">Start:</Text>
          <Text fontSize="sm">{formatDate(stream.startTime)}</Text>
        </HStack>
        
        <HStack justify="space-between" mb={2}>
          <Text fontSize="sm" color="gray.600">End:</Text>
          <Text fontSize="sm">{formatDate(stream.endTime)}</Text>
        </HStack>
        
        <HStack justify="space-between" mb={4}>
          <Text fontSize="sm" color="gray.600">Total Amount:</Text>
          <Text fontSize="sm" fontWeight="medium">{formatApt(stream.amount)} APT</Text>
        </HStack>
        
        {stream.status === 'active' && (
          <>
            <Box mb={4}>
              <Flex justify="space-between" mb={1}>
                <Text fontSize="xs" color="gray.600">Progress</Text>
                <Text fontSize="xs" color="gray.600">{progress}%</Text>
              </Flex>
              <Progress 
                value={progress} 
                size="sm" 
                colorScheme="purple" 
                hasStripe 
                isAnimated
              />
            </Box>
            
            <Box p={3} bg="purple.50" borderRadius="md" mb={4}>
              <Flex justify="space-between">
                <Text fontSize="sm" color="gray.600">Available:</Text>
                <Text fontSize="sm" fontWeight="bold" color="purple.600">
                  {formatApt(available.toString())} APT
                </Text>
              </Flex>
            </Box>
            
            {isRecipient ? (
              <Button
                colorScheme="purple"
                width="full"
                onClick={handleAction}
                isLoading={isLoading}
                loadingText="Withdrawing"
                isDisabled={available <= 0}
              >
                Withdraw Available Funds
              </Button>
            ) : (
              <Button
                colorScheme="red"
                variant="outline"
                width="full"
                onClick={handleAction}
                isLoading={isLoading}
                loadingText="Cancelling"
              >
                Cancel Stream
              </Button>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};
