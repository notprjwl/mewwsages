import { Session } from "next-auth";
import ConversationModal from "./Modal/ConversationModal";
import { Box, Text } from "@chakra-ui/react";
import { useState } from "react";
import { Arimo } from "next/font/google";
import { ConversationPopulated } from "../../../../../backend/src/util/types";
import ConversationItem from "./ConversationItem";
import { useRouter } from "next/router";
import { GraphQLError } from "graphql";
import { useMutation } from "@apollo/client";
import ConversationOperations from "../../../graphql/operations/conversation";
import toast from "react-hot-toast";

interface IConversationListProps {
  session: Session;
  conversations: Array<ConversationPopulated>;
  onViewConversation: (conversationId: string, hasSeenLatestMessage: boolean | undefined) => void;
}

const ConversationList: React.FC<IConversationListProps> = ({
  session,
  conversations,
  onViewConversation,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteConversation] = useMutation<{ deleteConversation: boolean; conversationId: string }>(
    ConversationOperations.Mutations.deleteConversation
  );
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const router = useRouter();

  const {
    user: { id: userId, image },
  } = session;

  const onDeleteConversation = async (conversationId: string) => {
    try {
      toast.promise(
        deleteConversation({
          variables: {
            conversationId,
          },
          update: () => {
            router.replace(
              typeof process.env.NEXT_PUBLIC_BASE_URL === "string"
                ? process.env.NEXT_PUBLIC_BASE_URL
                : ""
            );
          },
        }),
        {
          loading: "Deleting conversation...",
          success: "Conversation deleted successfully!",
          error: "Failed to delete conversation",
        }
      );
    } catch (error: any) {
      console.log("onDeleteConversation error: ", error);
      throw new GraphQLError("Error deleting conversation");
    }
  };

  const sortedConversations = [...conversations].sort(
    (a, b) => b.updatedAt.valueOf() - a.updatedAt.valueOf()
  );

  return (
    <Box width='100%'>
      <Text
        fontSize={25}
        fontWeight={500}
        pb={4}
        fontFamily='myFont'
        cursor='pointer'
        display='inline-block'>
        Mewwsages🐈‍⬛
      </Text>
      <Box
        py={2}
        px={4}
        mb={4}
        _hover={{ bg: "blackAlpha.400" }}
        bg='blackAlpha.300'
        borderRadius={4}
        cursor='pointer'
        onClick={onOpen}>
        <Text textAlign='center' color='whiteAlpha.800' fontWeight={500} fontFamily='myFont'>
          Find or start a conversation
        </Text>
      </Box>
      <ConversationModal session={session} isOpen={isOpen} onClose={onClose} />
      {sortedConversations.map((conversation) => {
        const participant = conversation.participants.find((p) => p.user.id === userId);

        return (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            onClick={() => onViewConversation(conversation.id, participant?.hasSeenLatestMessage)}
            isSelected={conversation.id === router.query.conversationId}
            userId={userId}
            image={image}
            hasSeenLatestMessage={participant?.hasSeenLatestMessage}
            onDeleteConversation={onDeleteConversation}
          />
        );
      })}
    </Box>
  );
};

export default ConversationList;
