import { Box, Tabs, TabList, Tab, TabPanels, TabPanel, VStack, Text } from '@chakra-ui/react';
import { StreamCard } from './StreamCard';

export const StreamList = ({ incomingStreams, outgoingStreams }) => {
  return (
    <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
      <Tabs colorScheme="purple">
        <TabList>
          <Tab>Incoming ({incomingStreams.length})</Tab>
          <Tab>Outgoing ({outgoingStreams.length})</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel p={4}>
            {incomingStreams.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {incomingStreams.map((stream) => (
                  <StreamCard 
                    key={stream.id} 
                    stream={stream} 
                    isRecipient={true}
                  />
                ))}
              </VStack>
            ) : (
              <Text color="gray.500" textAlign="center" py={8}>
                No incoming streams found
              </Text>
            )}
          </TabPanel>
          
          <TabPanel p={4}>
            {outgoingStreams.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {outgoingStreams.map((stream) => (
                  <StreamCard 
                    key={stream.id} 
                    stream={stream} 
                    isRecipient={false}
                  />
                ))}
              </VStack>
            ) : (
              <Text color="gray.500" textAlign="center" py={8}>
                No outgoing streams found
              </Text>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};
