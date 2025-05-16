// Format address to display format
export const formatAddress = (address) => {
  if (!address) return '';
  if (typeof address === 'string' && address.length > 10) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  return address;
};

// Format APT amount (from atomic units)
export const formatApt = (amount) => {
  if (!amount) return '0';
  return (parseInt(amount) / 100000000).toFixed(6);
};

// Parse APT amount (to atomic units)
export const parseApt = (amount) => {
  const parsed = parseFloat(amount);
  if (isNaN(parsed)) return '0';
  return Math.floor(parsed * 100000000).toString();
};

// Get current timestamp in seconds
export const getCurrentTimestamp = () => {
  return Math.floor(Date.now() / 1000);
};

// Format date from timestamp
export const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString();
};
