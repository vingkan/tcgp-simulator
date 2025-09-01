import { Box, Flex, Heading, Text } from "@radix-ui/themes";

export default function Home() {
  return (
    <Box>
      <Flex direction="column" gap="2" my="2">
        <Flex justify="start" align="center" gap="4">
          <img
            src="../tcgp-simulator/icon.png"
            alt="logo"
            width={64}
            height={64}
          />
          <Heading size="8">TCGP Simulator</Heading>
        </Flex>
        <Text>Welcome.</Text>
      </Flex>
    </Box>
  );
}
