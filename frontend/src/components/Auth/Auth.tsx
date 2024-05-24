import { signIn } from "next-auth/react";
import { Button, Center, Image, Input, Stack, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useState } from "react";
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
        throw new Error(String(error));
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
    <Center height="100vh">
    <Stack spacing={4} align="center">
      {session ? (
        <>
          <Text fontSize="2xl">Create a Username</Text>
          <Input
            placeholder="Enter a username"
            value={username}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setUsername(event.target.value)
            }
          />
          <Button onClick={onSubmit} width="100%" isLoading={loading}>
            Save
          </Button>
        </>
      ) : (
        <>
          <Text fontSize="3xl">Mewwsages 🐈‍⬛</Text>
          <Button
            onClick={() => signIn("google")}
            leftIcon={<Image height="20px" src="/images/googlelogo.png" />}
          >
            Continue with Google
          </Button>
        </>
      )}
    </Stack>
  </Center>
  );
};

export default Auth;
