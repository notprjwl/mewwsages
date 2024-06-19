import { Box, Input } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useState } from "react";
import toast from "react-hot-toast";
interface MessageInputProps {
  session: Session;
  conversationId: string;
}

const MessageInput = ({ session, conversationId }: MessageInputProps) => {
  const [messageBody, setMessageBody] = useState("");

  const onSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
        // call sendMessage Mutation here
    } catch (error: any) {
        console.log("onSendMessage error", error);
        toast.error(error?.message);
    }
  }

  return (
    <Box px={5} py={5} width='100%'>
      <form onSubmit={() => {}}>
        <Input value={messageBody} onChange={(e) => setMessageBody(e.target.value)} size='md' placeholder='New message' _focus={{ boxShadow: "none", border: "1px ", borderColor: "whiteAlpha.500" }} resize="none" />
      </form>
    </Box>
  );
};

export default MessageInput;
