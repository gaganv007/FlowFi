import { Box, Container, Flex, Heading, Text, VStack, Image } from '@chakra-ui/react';

export default function Footer() {
  return (
    <Box 
      as="footer" 
      bg="white" 
      py={10} 
      borderTop="1px" 
      borderColor="gray.200"
      mt={10}
    >
      <Container maxW="container.xl">
        <Flex 
          justify="space-between" 
          align="center" 
          direction={{ base: 'column', md: 'row' }}
        >
          <VStack align={{ base: 'center', md: 'start' }}>
            <Flex align="center">
              <Image 
                src="/images/flowfi-logo.png" 
                alt="FlowFi Logo" 
                height="32px" 
                mr={2} 
              />
              <Heading size="md" color="purple.600">FlowFi</Heading>
            </Flex>
            <Text fontSize="sm" color="gray.500">
              Reimagining how money and values move
            </Text>
          </VStack>
          
          <Text fontSize="sm" color="gray.500" mt={{ base: 4, md: 0 }}>
            &copy; {new Date().getFullYear()} FlowFi. Built on Aptos.
          </Text>
        </Flex>
      </Container>
    </Box>
  );
}
