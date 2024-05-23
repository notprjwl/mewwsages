import { NextPageContext } from "next";
import { getSession, useSession } from "next-auth/react";
import Auth from "../components/Auth/Auth";
import Chat from "../components/Chat/Chat";
import { Session } from "next-auth";

export default function Home() {
  const { data: session } = useSession();

  console.log("here is the session", session);

  const reloadSession = () => {
    const event = new Event("visibilitychange");
    document.dispatchEvent(event);
  };

  return (<>
  {session?.user?.username ? <Chat session={session} /> : <Auth session={session} reloadSession={reloadSession} />}</>);
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);

  return {
    props: {
      session,
    },
  };
}
