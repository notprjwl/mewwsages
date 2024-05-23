import { Box, Text } from "@radix-ui/themes";
import { Session } from "next-auth";
import ConversationModal from "./Modal/ConversationModalProps";

interface IConversationListProps {
  session: Session;
}

const ConversationList: React.FC<IConversationListProps> = ({ session }) => {
  return (
    <Box className="w-full">
      <Box className="px-4 py-3 rounded-lg bg-bg m-5 cursor-pointer text-center" onClick={() => {}}>
        <Text className="text-whiteAlpha800 font-medium">Find or start a Conversation</Text>
      </Box>
      <ConversationModal />
    </Box>
  );
};

export default ConversationList;
