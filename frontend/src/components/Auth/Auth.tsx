import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { Session } from "next-auth";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface IAuthProps {
  session: Session | null;
  reloadSession: () => void;
}

const Auth: React.FC<IAuthProps> = ({ session, reloadSession }) => {
  const [username, setUsername] = useState("");

  const onSubmit = async () => {
    try {
      // create username mutation to send in our GraphQL API
    } catch (error) {
      console.log("onSubmit error", error);
    }
  };

  return (
    <div className='h-[100vh] flex-col gap-2 flex mx-auto items-center justify-center'>
      {session ? (
        <> <div className="justify-center flex flex-col items-center text-center w-50% gap-5">
          <h1 className="text-2xl w-full">Create a Username</h1>
          <Input type='text' placeholder='Enter a username' value={username} onChange={(e) => setUsername(e.target.value)} className="w-60" />
          <Button variant="outline" onClick={onSubmit} className="bg-buttonColor opacity-70 text-text w-full">Submit</Button>
        </div>
        </>
      ) : (
        <>
          <div className='text-2xl'>Mewwsages 🐈‍⬛</div>
          <Button variant='outline' className='bg-buttonColor gap-2' onClick={() => signIn()}>
            <img src='/images/googlelogo.png' alt='googleImg' height={20} width={20} className='bg-transparent' />
            Continue with Google
          </Button>
        </>
      )}
    </div>
  );
};

export default Auth;
