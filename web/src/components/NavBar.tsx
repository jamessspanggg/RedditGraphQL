import {Box, Button, Flex, Link} from '@chakra-ui/react';
import React from 'react';
import NextLink from 'next/link';
import {useLogoutMutation, useMeQuery} from '../generated/graphql';
import {isServer} from '../../utils/isServer';

interface Props {}

const NavBar: React.FC<Props> = () => {
  const [{data, fetching}] = useMeQuery({pause: isServer()});
  const [{fetching: fetchingLogout}, logout] = useLogoutMutation();

  let body = null;
  if (fetching) {
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link mr={2}>register</Link>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Flex>
        <Box mr={4}>{data.me.username}</Box>
        <Button isLoading={fetchingLogout} onClick={() => logout()} variant="link">
          logout
        </Button>
      </Flex>
    );
  }
  return (
    <Flex bg="tan">
      <Box p={4} ml="auto">
        {body}
      </Box>
    </Flex>
  );
};

export default NavBar;
