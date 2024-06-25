import { useMutation } from "@apollo/client";
import { Box, Input } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useState } from "react";
import { ObjectId } from "bson";
import toast from "react-hot-toast";
import MessageOperations from "../../../../graphql/operations/message";
import { sendMessageArguments } from "../../../../../../backend/src/util/types";
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
      });

      if (!data?.sendMessage || errors) {
        throw new Error("FAILED TO SEND MESSAGE");
      }

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
