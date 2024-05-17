import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface IChatProps {
}

const Chat: React.FC<IChatProps> = (props) => {
  return(
    <div className="">
        Chat
        <Button variant="outline" onClick={() => signOut()}>SignOut</Button>
    </div>
  )
};

export default Chat;
