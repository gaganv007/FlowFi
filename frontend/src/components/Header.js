import { Box, Container, Flex, Heading, Text, HStack, Image } from '@chakra-ui/react';
import WalletButton from './WalletButton';

export default function Header() {
  return (
    <Box as="header" bg="white" boxShadow="sm" py={4}>
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center">
          <HStack spacing={2}>
            <Image 
              src="/images/flowfi-logo.png" 
              alt="FlowFi Logo" 
              height="40px" 
              mr={2}
            />
            <Heading size="md" color="purple.600">FlowFi</Heading>
            <Text fontSize="xs" color="gray.500" mt={1}>on Aptos</Text>
          </HStack>
          <WalletButton />
        </Flex>
      </Container>
    </Box>
  );
}
