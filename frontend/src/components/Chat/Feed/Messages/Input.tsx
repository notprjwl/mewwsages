import { useMutation } from "@apollo/client";
import { Box, Input } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useState } from "react";
import { ObjectId } from "bson";
import toast from "react-hot-toast";
import MessageOperations from "../../../../graphql/operations/message";
import { sendMessageArguments } from "../../../../../../backend/src/util/types";
import { MessagesData } from "@/src/util/types";
interface IMessageInputProps {
  session: Session;
  conversationId: string;
}

const MessageInput: React.FunctionComponent<IMessageInputProps> = ({ session, conversationId }) => {
  const [messageBody, setMessageBody] = useState("");
  const [sendMessage] = useMutation<{ sendMessage: boolean }, sendMessageArguments>(MessageOperations.Mutation.sendMessage);

  const onSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // call sendMessage Mutation here
      const { id: senderId } = session.user;
      // generate a new messageId
      const messageId = new ObjectId().toString();
      // object we are going to send to the backend
      const newMessage: sendMessageArguments = {
        id: messageId,
        senderId,
        conversationId,
        body: messageBody,
      };

      const { data, errors } = await sendMessage({
        variables: {
          ...newMessage,
        },
        // optimistic response getting the data from the apollo cache before the server sends the success response back
        optimisticResponse: {
          sendMessage: true,
        },
        // here we grab the existing messages from the cache
        update: (cache) => {
          const existing = cache.readQuery<MessagesData>({
            query: MessageOperations.Query.messages,
            variables: { conversationId },
          }) as MessagesData;

          // we update it with the new message and write the data to the cache
          cache.writeQuery<MessagesData, { conversationId: string }>({
            query: MessageOperations.Query.messages,
            variables: { conversationId },
            data: {
              ...existing,
              messages: [
                {
                  id: messageId,
                  senderId: session.user.id,
                  conversationId,
                  body: messageBody,
                  sender: {
                    id: session.user.id,
                    username: session.user.username,
                    image: session.user.image,
                  },
                  image: null,
                  createdAt: new Date(Date.now()),
                  updatedAt: new Date(Date.now()),
                },
                ...existing.messages,
              ],
            }, 
          });
          setMessageBody("");
        },
      });

      if (!data?.sendMessage || errors) {
        throw new Error("FAILED TO SEND MESSAGE");
      }
      setMessageBody("");
    } catch (error: any) {
      console.log("onSendMessage error", error);
      toast.error(error?.message);
    }
  };

  return (
    <Box px={5} py={5} width='100%'>
      <form onSubmit={onSendMessage}>
        <Input value={messageBody} onChange={(e) => setMessageBody(e.target.value)} size='md' placeholder='New message' _focus={{ boxShadow: "none", border: "1px ", borderColor: "whiteAlpha.500" }} resize='none' />
      </form>
    </Box>
  );
};

export default MessageInput;
