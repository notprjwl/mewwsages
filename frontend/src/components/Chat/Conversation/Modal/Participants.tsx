import { SearchedUser } from "@/src/util/types";
import { Flex, Stack, Text } from "@chakra-ui/react";
import { IoIosCloseCircleOutline } from "react-icons/io";

interface ParticipantsProps {
  participants: Array<SearchedUser>;
  removeParticipant: (userId: string) => void;
}

const Participants: React.FunctionComponent<ParticipantsProps> = ({ participants, removeParticipant }) => {
  console.log(participants);
  return (
    <Flex gap={2} flexWrap='wrap'>
      {participants.map((participant) => (
        <Stack key={participant.id} direction='row' p={1} px={2} mt={2} align='center' bg='whiteAlpha.200' borderRadius={4}>
          <Text>{participant.username}</Text>
          <IoIosCloseCircleOutline size={20} cursor='pointer' onClick={() => removeParticipant(participant.id)} />
        </Stack>
      ))}
    </Flex>
  );
};

export default Participants;
