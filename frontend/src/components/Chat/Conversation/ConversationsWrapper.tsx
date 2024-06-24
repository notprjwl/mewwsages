import { useQuery } from "@apollo/client";
import { Session } from "next-auth";
import ConversationList from "./ConversationList";
import { Box } from "@chakra-ui/react";
import ConversationOperations from "../../../graphql/operations/conversation";
import { ConversationsData } from "@/src/util/types";
import { ConversationPopulated } from "../../../../../backend/src/util/types";
import { useEffect } from "react";
import { useRouter } from "next/router";
import SkeletonLoader from "../../common/SkeletonLoader";

interface ConversationsWrapperProps {
  session: Session;
}

const ConversationsWrapper: React.FC<ConversationsWrapperProps> = ({ session }) => {
  const { data: conversationsData, error: conversationsError, loading: conversationsLoading, subscribeToMore } = useQuery<ConversationsData>(ConversationOperations.Queries.conversations);

  const router = useRouter();

  const { conversationId } = router.query;

  const onViewConversation = async (conversationId: string) => {
    /**
     * 1. Push the ConversationID to the router query params
     */
    router.push({ query: { conversationId } });

    /**
     * 2. Mark the Conversation as read
     */
  };

  // subscribe to new conversations. refer docs: https://www.apollographql.com/docs/react/data/subscriptions
  const subscribeToNewConversations = () => {
    subscribeToMore({
      document: ConversationOperations.Subscriptions.conversationCreated,
      updateQuery: (prev, { subscriptionData }: { subscriptionData: { data: { conversationCreated: ConversationPopulated } } }) => {
        if (!subscriptionData.data) return prev;
        const newConversation = subscriptionData.data.conversationCreated;

        const exists = prev.conversations.find((conversation) => conversation.id === newConversation.id);
        if (exists) return prev;

        return Object.assign({}, prev, {
          conversations: [newConversation, ...prev.conversations],
        });
      },
    });
  };

  /**
   * EXECUTE SUBSCRIPTION ON MOUNT
   */
  useEffect(() => {
    subscribeToNewConversations();
  }, []);

  return (
    <Box width={{ base: "100%", md: "400px" }} bg='whiteAlpha.50' py={5} px={3} flexDirection="column" gap={3} display={{ base: conversationId ? "none" : "flex", md: "flex" }}>
      {conversationsLoading ? <SkeletonLoader count={7} height='65px' /> : <ConversationList session={session} conversations={conversationsData?.conversations || []} onViewConversation={onViewConversation} />}
    </Box>
  );
};

export default ConversationsWrapper;
