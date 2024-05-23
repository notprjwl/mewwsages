import { Flex } from "@radix-ui/themes";
import ConversationsWrapper from "./Conversation/ConversationsWrapper";
import FeedWrapper from "./Feed/FeedWrapper";
import { Session } from "next-auth";

interface ChatProps {
  session: Session;
}

const Chat: React.FC<ChatProps> = ({session}) => {
  return (
    <Flex className='h-[100vh]'>
      <ConversationsWrapper session={session} />
      <FeedWrapper session={session} />
    </Flex>
  );
};

export default Chat;
