import { Link } from "react-router-dom";
import { Flex, Heading, Text } from "@radix-ui/themes";

export default function NotFound() {
  return (
    <div>
      <Flex direction="column" gap="2" my="2">
        <Heading size="8">Not Found</Heading>
        <Text>The page you are looking for does not exist.</Text>
        <Link to="/">Go to home</Link>
      </Flex>
    </div>
  );
}
