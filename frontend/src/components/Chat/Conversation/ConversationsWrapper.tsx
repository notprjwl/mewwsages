import { Session } from "next-auth";
import ConversationList from "./ConversationList";
import { Box } from "@chakra-ui/react";

interface ConversationsWrapperProps {
  session: Session;
}

const ConversationsWrapper: React.FC<ConversationsWrapperProps> = ({ session }) => {
  return (
    <Box width={{ base: "100%", md: "400px" }} bg="whiteAlpha.50" py={5} px={3} >
      {/* skeleton loader */}
      <ConversationList session={session} />
    </Box>
  );
};

export default ConversationsWrapper;
