import { Avatar, Box, Flex, Menu, MenuItem, MenuList, Stack, Text } from "@chakra-ui/react";
import { formatRelative } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import React, { useState } from "react";
import { GoDotFill } from "react-icons/go";
import { MdDeleteOutline } from "react-icons/md";
import { AiOutlineEdit } from "react-icons/ai";
import { formatUsernames } from "../../../util/functions";
import { ConversationPopulated } from "../../../util/types";

const formatRelativeLocale = {
  lastWeek: "eeee",
  yesterday: "'Yesterday",
  today: "p",
  other: "MM/dd/yy",
};

interface ConversationItemProps {
  userId: string;
  image: string;
  conversation: ConversationPopulated;
  onClick: () => void;
  isSelected: boolean;
  hasSeenLatestMessage: boolean | undefined;
  onDeleteConversation: (conversationId: string) => void;
  //   onEditConversation?: () => void;
  // hasSeenLatestMessage?: boolean;
  //   selectedConversationId?: string;
  //   onLeaveConversation?: (conversation: ConversationPopulated) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  userId,
  image,
  conversation,
  onClick,
  isSelected,
  hasSeenLatestMessage,
  onDeleteConversation,
  //   selectedConversationId,
  //   onEditConversation,
  //   onLeaveConversation,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleClick = (event: React.MouseEvent) => {
    if (event.type === "click") {
      onClick();
    } else if (event.type === "contextmenu") {
      event.preventDefault();
      setMenuOpen(true);
    }
  };

  return (
    <Stack
      direction='row'
      align='center'
      justify='space-between'
      mb={2}
      p={2}
      px={4}
      cursor='pointer'
      borderRadius={4}
      bg={isSelected ? "whiteAlpha.200" : "none"}
      _hover={{ bg: "whiteAlpha.200" }}
      onClick={handleClick}
      onContextMenu={handleClick}
      position='relative'>
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)}>
        <MenuList bg='#2d2d2d' p={0} borderRadius={10}>
          <MenuItem
            icon={<AiOutlineEdit fontSize={20} />}
            onClick={(event) => {
              event.stopPropagation();
              //   onEditConversation();
            }}
            bg='#2d2d2d'
            _hover={{ bg: "whiteAlpha.300" }}
            borderRadius={10}
            borderBottomRadius={0}>
            Edit
          </MenuItem>
          <MenuItem
            icon={<MdDeleteOutline fontSize={20} />}
            onClick={(event) => {
              event.stopPropagation();
              onDeleteConversation(conversation.id);
            }}
            bg='#2d2d2d'
            _hover={{ bg: "whiteAlpha.300" }}
            borderRadius={10}
            borderTopRadius={0}>
            Delete
          </MenuItem>
          {/* {conversation.participants.length > 2 ? (
            <MenuItem
              icon={<BiLogOut fontSize={20} />}
              onClick={(event) => {
                event.stopPropagation();
                // onLeaveConversation(conversation);
              }}
            >
              Leave
            </MenuItem>
          ) : (
            <MenuItem
              icon={<MdDeleteOutline fontSize={20} />}
              onClick={(event) => {
                event.stopPropagation();
                // onDeleteConversation(conversation.id);
              }}
            >
              Delete
            </MenuItem>
          )} */}
        </MenuList>
      </Menu>
      <Flex position='absolute' left='-3px'>
        {hasSeenLatestMessage === false && <GoDotFill fontSize={18} color='#6B46C1' />}
      </Flex>
      <Avatar
        src={`${conversation.participants.find((p) => p.user.id !== userId)?.user.image}`}
        size={["md"]}
      />
      <Flex justify='space-between' width='100%' height='100%'>
        <Flex direction='column' width='70%' height='100%'>
          <Text
            fontWeight={600}
            whiteSpace='nowrap'
            fontSize={["sm", "md"]}
            overflow='hidden'
            textOverflow='ellipsis'>
            {formatUsernames(conversation.participants, userId)}
          </Text>
          {conversation.latestMessage && (
            <Box width={{base: "126%", md: "114%" }}>
              <Text
                color='whiteAlpha.700'
                whiteSpace='nowrap'
                overflow='hidden'
                textOverflow='ellipsis'>
                {conversation.latestMessage.body}
              </Text>
            </Box>
          )}
        </Flex>
        <Text color='whiteAlpha.700' fontSize='sm' textAlign='right' position='absolute' right={4}>
          {formatRelative(new Date(conversation.updatedAt), new Date(), {
            locale: {
              ...enUS,
              formatRelative: (token) =>
                formatRelativeLocale[token as keyof typeof formatRelativeLocale],
            },
          })}
        </Text>
      </Flex>
    </Stack>
  );
};
export default ConversationItem;
