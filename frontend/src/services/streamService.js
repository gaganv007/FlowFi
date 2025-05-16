import { getCurrentTimestamp } from '../utils/formatters';

// Keep track of created streams
const createdStreams = [];

// In a production app, you'd fetch streams from the blockchain
// For this demo, we're using mock data with the ability to add new streams
export async function getStreamsForAccount(address) {
  if (!address) return [];
  
  // Create mock streams for demonstration if none exist yet
  if (createdStreams.length === 0) {
    const now = getCurrentTimestamp();
    
    // Add initial mock streams
    createdStreams.push({
      id: '1',
      sender: '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
      recipient: address,
      amount: '100000000', // 1 APT
      startTime: now - 3600, // 1 hour ago
      endTime: now + 3600, // 1 hour from now
      duration: 7200, // 2 hours
      ratePerSecond: '13888',
      withdrawnAmount: '50000000', // 0.5 APT
      status: 'active'
    });
  }
  
  // Return all streams where this address is either sender or recipient
  return createdStreams.filter(stream => 
    stream.recipient === address || stream.sender === address
  );
}

// Add a new stream
export function addStream(stream) {
  // Generate a unique ID
  const newId = (createdStreams.length + 1).toString();
  
  // Add to streams
  createdStreams.push({
    ...stream,
    id: newId
  });
  
  return newId;
}

// Get a specific stream by ID
export function getStreamById(id) {
  return createdStreams.find(stream => stream.id === id);
}

// Update a stream (for withdrawals or cancellations)
export function updateStream(id, updates) {
  const streamIndex = createdStreams.findIndex(stream => stream.id === id);
  
  if (streamIndex !== -1) {
    createdStreams[streamIndex] = {
      ...createdStreams[streamIndex],
      ...updates
    };
    
    return true;
  }
  
  return false;
}
