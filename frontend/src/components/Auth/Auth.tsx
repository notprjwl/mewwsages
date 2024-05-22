import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { Session } from "next-auth";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useMutation } from "@apollo/client";
import UserOperations from "@/src/graphql/operations/user";
import { CreateUsernameData, CreateUsernameVariables } from "@/src/util/types";
import toast from "react-hot-toast";

interface IAuthProps {
  session: Session | null;
  reloadSession: () => void;
}

const Auth: React.FC<IAuthProps> = ({ session, reloadSession }) => {
  const [username, setUsername] = useState("");

  const [createUsername, { loading, error }] = useMutation<CreateUsernameData, CreateUsernameVariables>(UserOperations.Mutations.createUsername);

  const onSubmit = async () => {
    if (!username) return;
    try {
      // create username mutation to send in our GraphQL API
      const { data } = await createUsername({ variables: { username } });

      if (!data?.createUsername) {
        throw new Error();
      }

      if (data.createUsername.error) {
        const {
          createUsername: { error },
        } = data;
        throw new Error(error);
      }

      toast.success('Username successfully created! 🚀');
      /**
       * reload session
       */
      reloadSession();
    } catch (error:any) {
      toast.error(error?.message)
      console.log("onSubmit error", error);
    }
  };

  return (
    <div className='h-[100vh] flex-col gap-2 flex mx-auto items-center justify-center'>
      {session ? (
        <>
          <div className='justify-center flex flex-col items-center text-center w-50% gap-5'>
            <h1 className='text-2xl w-full'>Create a Username</h1>
            <Input type='text' placeholder='Enter a username' value={username} onChange={(e) => setUsername(e.target.value)} className='w-60' />
            <Button variant='outline' onClick={onSubmit} className='bg-buttonColor opacity-70 text-text w-full'>
              Submit
            </Button>
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
