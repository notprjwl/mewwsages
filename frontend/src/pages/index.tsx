import { NextPageContext } from "next";
import { getSession, signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  console.log("here is the data", session);

  return (
    <>
      {session?.user ? <button onClick={() => signOut()}>SignOut</button> : <button onClick={() => signIn()}>SignIn</button>}
      {session?.user?.name}
    </>
  );
}

export async function getServerSideProps(context:NextPageContext) {
  const session = await getSession(context)

  return ({
    props:{
      session,
    }
  })
  
}
