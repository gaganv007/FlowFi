import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  HStack,
  Text,
  useToast
} from '@chakra-ui/react';
import { formatDate, parseApt, formatApt } from '../utils/formatters';
import { useFlowFi } from '../hooks/useFlowFi';

export const CreateStream = () => {
  const toast = useToast();
  const { createStream, isCreating } = useFlowFi();
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [error, setError] = useState('');
  
  // Calculate stream rate
  const calculateRate = () => {
    if (!amount || !duration) return null;
    
    const amountValue = parseFloat(amount);
    const durationHours = parseInt(duration);
    
    if (isNaN(amountValue) || isNaN(durationHours) || durationHours === 0) {
      return null;
    }
    
    return amountValue / (durationHours * 3600);
  };
  
  // Calculate end time
  const calculateEndDate = () => {
    if (!duration) return null;
    
    const now = new Date();
    now.setHours(now.getHours() + parseInt(duration));
    return now.toLocaleString();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!recipient || !amount || !duration) {
      setError('Please fill out all required fields');
      return;
    }
    
    if (!/^0x[a-fA-F0-9]{64}$/.test(recipient)) {
      setError('Please enter a valid Aptos address starting with 0x');
      return;
    }
    
    try {
      setError('');
      
      const result = await createStream({
        recipient,
        amount,
        duration: parseInt(duration)
      });
      
      toast({
        title: "Stream Created",
        description: `Transaction hash: ${result.hash}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      setRecipient('');
      setAmount('');
      setDuration('');
      
      // Reload page to show new stream
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error('Error creating stream:', error);
      setError(error.message || 'Failed to create stream');
    }
  };
  
  const rate = calculateRate();
  const endDate = calculateEndDate();
  
  return (
    <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
      <Heading size="md" mb={4}>Create New Stream</Heading>
      
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Recipient Address</FormLabel>
            <Input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
            />
          </FormControl>
          
          <HStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Amount (APT)</FormLabel>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1.0"
                type="number"
                step="0.001"
                min="0"
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Duration (hours)</FormLabel>
              <Input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="24"
                type="number"
                min="1"
              />
            </FormControl>
          </HStack>
          
          {error && <Text color="red.500">{error}</Text>}
          
          {rate && (
            <Box p={4} bg="gray.50" borderRadius="md">
              <Text fontWeight="medium" mb={2}>Stream Preview</Text>
              <Text>Flow Rate: {rate.toFixed(8)} APT/second</Text>
              <Text>Total Amount: {amount} APT</Text>
              <Text>Duration: {duration} hours</Text>
              {endDate && <Text>End Date: {endDate}</Text>}
            </Box>
          )}
          
          <Button 
            colorScheme="purple"
            type="submit"
            isLoading={isCreating}
            loadingText="Creating..."
          >
            Create Stream
          </Button>
        </VStack>
      </form>
    </Box>
  );
};
