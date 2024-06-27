import { MessageFields } from "@/src/graphql/operations/message";
import { MessagesData, MessagesVariables, MessageSubscriptionData } from "@/src/util/types";
import { useQuery } from "@apollo/client";
import MessageOperations from "../../../../graphql/operations/message";
import { Flex, Stack } from "@chakra-ui/react";
import toast from "react-hot-toast";
import MessageItem from "./MessageItem";
import SkeletonLoader from "@/src/components/common/SkeletonLoader";
import { subscribe } from "diagnostics_channel";
import { useEffect } from "react";

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

  if (error) {
    return null;
  }

  // const subscribeToMoreMessages = (conversationId: string) => {
  //   return subscribeToMore({
  //     document: MessageOperations.Subscription.messageSent,
  //     variables: {
  //       conversationId,
  //     },
  //     updateQuery: (prev, { subscriptionData }: MessageSubscriptionData) => {
  //       if (!subscriptionData.data) return prev;

  //       const newMessage = subscriptionData.data.messageSent;

  //       return Object.assign({}, prev, {
  //         messages:
  //           newMessage.sender.id === userId
  //             ? prev.messages
  //             : [newMessage, ...prev.messages],
  //       });
  //     },
  //   });
  // };

  // useEffect(() => {
  //   subscribeToMoreMessages(conversationId)
  // }, [conversationId])
  useEffect(() => {
    const subscribeToMoreMessages = (conversationId: string) => {
      return subscribeToMore({
        document: MessageOperations.Subscription.messageSent,
        variables: { conversationId },
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData?.data) return prev;

          const newMessage = subscriptionData.data.messageSent;

          // Check if the new message already exists in messages array
          const alreadyExists = prev.messages.some((msg) => msg.id === newMessage.id);
          if (alreadyExists) return prev;

          // Append new message to messages array
          return {
            ...prev,
            messages: [newMessage, ...prev.messages],
          };
        },
      });
    };

    const unsubscribe = subscribeToMoreMessages(conversationId);

    // Clean up subscription on component unmount
    return () => {
      unsubscribe();
    };
  }, [conversationId, subscribeToMore]);

  console.log("HERE IS THE MESSAGES DATA", data);

  return (
    <Flex direction='column' justify='flex-end' overflow='hidden'>
      {loading && (
        <Stack spacing={3} px={5}>
          <SkeletonLoader count={4} height='60px' />
        </Stack>
      )}
      {data?.messages && (
        <Flex direction='column-reverse' overflowY='scroll' height='100%'>
          {data.messages.map((message) => (
            <MessageItem key={message.id} message={message} sentByMe={message.sender.id === userId}/>
            // <div key={message.id}>{message.body}</div>
          ))}
        </Flex>
      )}
    </Flex>
  );
};

export default Messages;
