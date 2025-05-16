import { useState } from 'react';
import { addStream, updateStream } from '../services/streamService';
import { getCurrentTimestamp, parseApt } from '../utils/formatters';

export function useFlowFi() {
  const [isCreating, setIsCreating] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Create a stream
  const createStream = async ({ recipient, amount, duration }) => {
    try {
      setIsCreating(true);
      
      // Convert amount to atomic units
      const atomicAmount = parseApt(amount);
      
      // Calculate stream timing
      const now = getCurrentTimestamp();
      const startTime = now; // Start immediately for demo
      const durationSeconds = duration * 3600; // Convert hours to seconds
      const endTime = startTime + durationSeconds;
      
      // Create new stream
      const newStream = {
        sender: typeof window !== 'undefined' && window.pontem ? await window.pontem.getAccount() : 'your-address',
        recipient,
        amount: atomicAmount,
        startTime,
        endTime,
        duration: durationSeconds,
        ratePerSecond: (parseInt(atomicAmount) / durationSeconds).toString(),
        withdrawnAmount: '0',
        status: 'active',
        lastUpdateTime: startTime
      };
      
      // Add to our local stream service
      const streamId = addStream(newStream);
      
      // For demonstration, simulate a transaction hash
      const hash = '0x' + Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
      
      return {
        success: true,
        hash,
        streamId
      };
    } catch (error) {
      console.error('Failed to create stream:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };
  
  // Withdraw from a stream
  const withdrawFromStream = async (sender, streamId) => {
    try {
      setIsWithdrawing(true);
      
      // Update stream withdrawnAmount
      // In a real implementation, this would be handled by the blockchain
      updateStream(streamId, {
        withdrawnAmount: '100000000', // Simulate withdrawing 1 APT
      });
      
      return {
        success: true,
        hash: '0x' + Math.random().toString(36).substring(2, 15)
      };
    } catch (error) {
      console.error('Failed to withdraw from stream:', error);
      throw error;
    } finally {
      setIsWithdrawing(false);
    }
  };
  
  // Cancel a stream
  const cancelStream = async (streamId) => {
    try {
      setIsCancelling(true);
      
      // Update stream status
      // In a real implementation, this would be handled by the blockchain
      updateStream(streamId, {
        status: 'cancelled'
      });
      
      return {
        success: true,
        hash: '0x' + Math.random().toString(36).substring(2, 15)
      };
    } catch (error) {
      console.error('Failed to cancel stream:', error);
      throw error;
    } finally {
      setIsCancelling(false);
    }
  };
  
  return {
    createStream,
    withdrawFromStream,
    cancelStream,
    isCreating,
    isWithdrawing,
    isCancelling
  };
}
