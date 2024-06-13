import { Session } from "next-auth";
import ConversationModal from "./Modal/ConversationModal";
import { Box, Text } from "@chakra-ui/react";
import { useState } from "react";
import { Arimo } from "next/font/google";
import { ConversationPopulated } from "../../../../../backend/src/util/types";
import ConversationItem from "./ConversationItem";

interface IConversationListProps {
  session: Session;
  conversations: Array<ConversationPopulated>;
}

const ConversationList: React.FC<IConversationListProps> = ({ session, conversations }) => {
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  return (
    <Box width='100%'>
      <Text fontSize={25} fontWeight={500} pb={4} fontFamily='myFont' cursor='pointer' display='inline-block'>
        Mewwsages🐈‍⬛
      </Text>
      <Box py={2} px={4} mb={4} _hover={{ bg: "blackAlpha.400"}} bg='blackAlpha.300' borderRadius={4} cursor='pointer' onClick={onOpen}>
        <Text textAlign='center' color='whiteAlpha.800' fontWeight={500} fontFamily='myFont'>
          Find or start a conversation
        </Text>
      </Box>
      <ConversationModal session={session} isOpen={isOpen} onClose={onClose} />
      {conversations.map((conversation) => (
        <ConversationItem key={conversation.id} conversation={conversation} />
      ))}
    </Box>
  );
};

export default ConversationList;
