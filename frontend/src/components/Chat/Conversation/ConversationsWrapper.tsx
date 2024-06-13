import { useQuery } from "@apollo/client";
import { Session } from "next-auth";
import ConversationList from "./ConversationList";
import { Box } from "@chakra-ui/react";
import ConversationOperations from "../../../graphql/operations/conversation";
import { ConversationsData } from "@/src/util/types";


interface ConversationsWrapperProps {
  session: Session;
}

const ConversationsWrapper: React.FC<ConversationsWrapperProps> = ({ session }) => {

  const {data: conversationsData, error: conversationsError, loading: conversationsLoading} = useQuery<ConversationsData>(ConversationOperations.Queries.conversations);

  console.log("HERE IS THE CONVERSATIONS DATA", conversationsData);


  return (
    <Box width={{ base: "100%", md: "400px" }} bg="whiteAlpha.50" py={5} px={3} >
      {/* skeleton loader */}
      <ConversationList session={session} conversations={conversationsData?.conversations || []} />
    </Box>
  );
};

export default ConversationsWrapper;
