import {Button, FormControl, FormLabel, FormErrorMessage, Input, Box, Link} from '@chakra-ui/react';
import React from 'react';
import {Form, Formik} from 'formik';
import {Wrapper} from '../components/Wrapper';
import {InputField} from '../components/InputField';
import NextLink from 'next/link';
import {useLoginMutation} from '../generated/graphql';
import {toErrorMap} from '../../utils/toErrorMap';
import {useRouter} from 'next/router';
import {withUrqlClient, WithUrqlClient} from 'next-urql';
import {createUrqlClient} from '../../utils/createUrqlClient';

interface Props {}

const Login: React.FC<Props> = () => {
  const [, login] = useLoginMutation(); // useMutation allows you to execute graphql queries at the client
  const router = useRouter();
  const handleLoginSubmit = async (values, {setErrors}) => {
    const response = await login(values);
    if (response.data?.login.errors) {
      setErrors(toErrorMap(response.data.login.errors));
    } else if (response.data?.login.user) {
      router.push('/');
    }
  };
  return (
    <Wrapper>
      <Formik initialValues={{usernameOrEmail: '', password: ''}} onSubmit={handleLoginSubmit}>
        {({isSubmitting}) => (
          <Form>
            <InputField name="usernameOrEmail" placeholder="Username or Email" label="Username or Email" />
            <Box mt={4}>
              <InputField name="password" placeholder="Password" label="Password" type="password" />
            </Box>
            <Box mt={4}>
              <Button mr={4} type="submit" colorScheme="teal" isLoading={isSubmitting}>
                Login
              </Button>
              <NextLink href="/forgot-password">
                <Link>Forgot password?</Link>
              </NextLink>
            </Box>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient, {ssr: false})(Login);
