import { useLazyQuery, useMutation } from "@apollo/client";
import { Button, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Stack } from "@chakra-ui/react";
import { useState } from "react";
import UserOperations from "../../../../graphql/operations/user";
import ConversationOperations from "../../../../graphql/operations/conversation";
import { CreateConversationData, CreateConversationInput, SearchedUser, SearchUsersData, SearchUsersInput } from "@/src/util/types";
import UserSearchList from "./UserSearchList";
import Participants from "./Participants";
import toast from "react-hot-toast";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";

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

  const { user: { id: userId} } = session;

  //search the users
  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchUsers({ variables: { username } });
  };

  console.log("HERE IS THE SEARCHED DATA", data);

  //add participant
  const addParticipant = (user: SearchedUser) => {
    setParticipants((prev) => [...prev, user]);
    setUsername("");
  };

  //remove participant
  const removeParticipant = (userId: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== userId));
  };

  //create conversation
  const onCreateConversation = async () => {
    const participantIds = [userId, ...participants.map((p) => p.id)]
    try {
      // createConversation mutation
      const { data } = await createConversation({
        variables: {
          participantIds,
        },
      });
      console.log('HERE IS OUR DATA', data)
    } catch (error: any) {
      console.log("onCreateConversation Error", error);
      toast.error(error?.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg='#2d2d2d' pb={3} fontWeight={400}>
        <ModalHeader fontWeight={400} fontFamily='myFont'>
          Create a Conversation
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={onSearch}>
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
              <Button bg='brand.100' width='100%' mt={5} _hover={{ bg: "brand.100" }} isLoading={createConversationLoading} onClick={onCreateConversation}>
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
