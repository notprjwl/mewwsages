import { Avatar, Box, Flex, Stack, Text } from "@chakra-ui/react";
import { MessagePopulated } from "../../../../../../backend/src/util/types";
import { formatRelative } from "date-fns";
import { enUS } from "date-fns/locale/en-US";

interface IMessageItemProps {
  message: MessagePopulated;
  sentByMe: boolean;
}

const formatRelativeLocale = {
  lastWeek: "'last' eeee 'at' p",
  yesterday: "'yesterday",
  today: "p",
  tomorrow: "'tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: 'P'
};

const MessageItem: React.FunctionComponent<IMessageItemProps> = ({ message, sentByMe }) => {
  return (
    <Stack direction='row' p={4} spacing={2} wordBreak='break-word' justify={sentByMe ? 'flex-end' : 'flex-start'} >
      {!sentByMe && (
        <Flex align='flex-end'>
          <Avatar size='xs' src={message.sender.image || ""} />
        </Flex>
      )}
      <Stack spacing={1} width='100%'>
        <Stack direction='row' align='center' justify={sentByMe ? 'flex-end' : 'flex-start'}>
          {!sentByMe && (
            <Text fontWeight={500} textAlign='left' fontSize='smaller'>
              {message.sender.username}
            </Text>
          )}
          <Text fontSize={13} align="center" color='whiteAlpha.700'>
            {formatRelative(message.createdAt, new Date(), {
              locale: {
                ...enUS,
                formatRelative: (token) => formatRelativeLocale[token as keyof typeof formatRelativeLocale],
              },
            })}
          </Text>
        </Stack>
        <Flex justify={sentByMe ? 'flex-end' : 'flex-start'}>
        <Box
            bg={sentByMe ? "brand.200" : "whiteAlpha.200"}
            px={4}
            py={2}
            borderRadius="20px"
            maxWidth="65%"
            _hover={{ bg: sentByMe ? "brand.100" : "whiteAlpha.300" }}
            boxShadow="md"
            borderTopRightRadius={sentByMe ? "20px" : "20px"}
            borderTopLeftRadius={!sentByMe ? "20px" : "20px"}
            borderBottomRightRadius={sentByMe ? "0" : "20px"}
            borderBottomLeftRadius={!sentByMe ? "0" : "20px"}
          >
            <Text >{message.body}</Text>
          </Box>
        </Flex>
      </Stack>
    </Stack>
  );
};

export default MessageItem;
