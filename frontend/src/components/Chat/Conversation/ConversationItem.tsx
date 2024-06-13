import { Stack, Text } from "@chakra-ui/react";
import { ConversationPopulated } from "../../../../../backend/src/util/types";

interface IConversationItemProps {
    conversation: ConversationPopulated
}

const ConversationItem: React.FunctionComponent<IConversationItemProps> = ({ conversation }) => {
  return (
    <Stack textAlign="center" >
        <Text p={4} _hover={{ bg: "whiteAlpha.200" }} borderRadius={4} cursor="pointer">
            {conversation.id}
        </Text>
    </Stack>
  )
};

export default ConversationItem;
