import { MessageFields } from "@/src/graphql/operations/message";
import { MessagesData, MessagesVariables } from "@/src/util/types";
import { useQuery } from "@apollo/client";
import MessageOperations from "../../../../graphql/operations/message";
import { Flex, Stack } from "@chakra-ui/react";
import toast from "react-hot-toast";
import MessageItem from "./MessageItem";
import SkeletonLoader from "@/src/components/common/SkeletonLoader";

interface IMessagesProps {
  userId: string;
  conversationId: string;
}

const Messages: React.FunctionComponent<IMessagesProps> = ({ userId, conversationId }) => {
  const { data, loading, error, subscribeToMore } = useQuery<MessagesData, MessagesVariables>(MessageOperations.Query.messages, {
    variables: {
      conversationId,
    },
    onError: ({ message }) => {
      toast.error(message);
    },
    onCompleted: () => {},
  });

  if(error) {
    return null;
  }

  console.log("HERE IS THE MESSAGES DATA", data);

  return (
    <Flex direction='column' justify='flex-end' overflow='hidden'>
      {loading && (
        <Stack spacing={3} px={5}>
          <SkeletonLoader count={4} height="60px" />
        </Stack>
      )}
      {data?.messages && (
        <Flex direction='column-reverse' overflowY='scroll' height='100%'>
          {data.messages.map((message) => (
            // <MessageItem />
            <div key={message.id}>{message.body}</div>
          ))}
        </Flex>
      )}
    </Flex>
  );
};

export default Messages;
