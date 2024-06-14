import { useLazyQuery, useMutation } from "@apollo/client";
import { Button, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Stack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import UserOperations from "../../../../graphql/operations/user";
import ConversationOperations from "../../../../graphql/operations/conversation";
import { CreateConversationData, CreateConversationInput, SearchedUser, SearchUsersData, SearchUsersInput } from "@/src/util/types";
import UserSearchList from "./UserSearchList";
import Participants from "./Participants";
import toast from "react-hot-toast";
import { Session } from "next-auth";
import { useRouter } from "next/router";

interface ConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session;
}

const ConversationModal: React.FunctionComponent<ConversationModalProps> = ({ session, isOpen, onClose }) => {
  const [username, setUsername] = useState("");
  const [participants, setParticipants] = useState<Array<SearchedUser>>([]);
  const [searchUsers, { data, error, loading }] = useLazyQuery<SearchUsersData, SearchUsersInput>(UserOperations.Queries.searchUsers);
  const [createConversation, { loading: createConversationLoading }] = useMutation<CreateConversationData, CreateConversationInput>(ConversationOperations.Mutations.createConversation);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);

  const {
    user: { id: userId },
  } = session;

  const router = useRouter();

  //search the users
  // const onSearch = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   searchUsers({ variables: { username } });
  //   setIsButtonDisabled(false);
  // };

  //live filtering
  useEffect(() => {
    if (username) {
      searchUsers({ variables: { username } });
    }
  }, [username]);


  //add participant
  const addParticipant = (user: SearchedUser) => {
    const isParticipantExists = participants.some((p) => p.id === user.id);
    if (!isParticipantExists) {
      setParticipants((prev) => [...prev, user]);
      setUsername("");
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
      toast.error("CONVERSATION WITH THIS PARTICIPANT ALREADY PRESENT");
    }
  };

  //remove participant
  const removeParticipant = (userId: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== userId));
  };

  //create conversation
  const onCreateConversation = async () => {
    const participantIds = [userId, ...participants.map((p) => p.id)];
    try {
      // createConversation mutation
      const { data, errors } = await createConversation({
        variables: {
          participantIds,
        },
      });

      if (!data?.createConversation || errors) {
        throw new Error("Failed to create conversation :(");
      }

      const {
        createConversation: { conversationId },
      } = data;

      router.push({ query: { conversationId } });

      /**
       * Clearing the state and close our modal on successful creation
       */
      setUsername("");
      setParticipants([]);
      onClose();

    } catch (error: any) {
      console.log("onCreateConversation Error", error);
      toast.error(error?.message);
    }
  };

  //

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg='#2d2d2d' pb={3} fontWeight={400}>
        <ModalHeader fontWeight={400} fontFamily='myFont'>
          Create a Conversation
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form>
            <Stack spacing={4}>
              <Input placeholder='Enter a username' value={username} onChange={(e) => setUsername(e.target.value)} />
              <Button type='submit' isDisabled={!username} isLoading={loading} fontFamily='myFont' fontWeight={200}>
                Search
              </Button>
            </Stack>
          </form>
          {data?.searchUsers && <UserSearchList users={data.searchUsers} addParticipant={addParticipant} />}
          {participants.length !== 0 && (
            <>
              <Participants participants={participants} removeParticipant={removeParticipant} />
              <Button bg='brand.100' width='100%' mt={4} _hover={{ bg: "brand.100" }} isLoading={createConversationLoading} onClick={onCreateConversation}>
                Create Conversation
              </Button>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ConversationModal;
