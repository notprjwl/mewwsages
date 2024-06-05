import { SearchedUser } from "@/src/util/types";
import { Avatar, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";

interface UserSearchListProps {
  users: Array<SearchedUser>;
  addParticipant: (user: SearchedUser) => void;
}

const UserSearchList: React.FunctionComponent<UserSearchListProps> = ({ users, addParticipant }) => {
  return (
    <>
      <div>
        {users.length === 0 ? (
          <Flex mt={5} justify='center'>
            <Text>No users found</Text>
          </Flex>
        ) : (
          <Stack mt={5}>
            {users.map((user) => (
              <Stack key={user.id} direction='row' align='center' p={1} px={4} _hover={{ bg: "whiteAlpha.200" }} borderRadius={5} gap={3}>
                <Avatar src={`${user.image}`} />
                <Flex justify='space-between' width='100%'>
                  <Text alignContent='center' color='whiteAlpha.700'>
                    {user.username}
                  </Text>
                  <Button
                    size='sm'
                    bg='brand.100'
                    _hover={{ bg: "brand.100" }}
                    fontFamily='myFont'
                    fontWeight={200}
                    onClick={() => {
                      addParticipant(user);
                    }}>
                    Select
                  </Button>
                </Flex>
              </Stack>
            ))}
          </Stack>
        )}
      </div>
    </>
  );
};

export default UserSearchList;
