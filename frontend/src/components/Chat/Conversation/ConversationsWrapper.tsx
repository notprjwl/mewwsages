import { Session } from "next-auth";
import ConversationList from "./ConversationList";

interface ConversationsWrapperProps {
  session: Session;
}

const ConversationsWrapper: React.FC<ConversationsWrapperProps> = ({ session }) => {
  return (
    <div className="w-full sm:w-full md:w-[400px] border bg-blackAlpha300">
      <ConversationList session={session} />
    </div>
  );
};

export default ConversationsWrapper;
