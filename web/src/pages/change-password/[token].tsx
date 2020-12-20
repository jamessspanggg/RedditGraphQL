import {Box, Button, Link} from '@chakra-ui/react';
import {Formik, Form} from 'formik';
import {NextPage} from 'next';
import NextLink from 'next/link';
import {withUrqlClient} from 'next-urql';
import router from 'next/router';
import React from 'react';
import {useState} from 'react';
import {createUrqlClient} from '../../../utils/createUrqlClient';
import {toErrorMap} from '../../../utils/toErrorMap';
import {InputField} from '../../components/InputField';
import {Wrapper} from '../../components/Wrapper';
import {useChangePasswordMutation} from '../../generated/graphql';

interface Props {}

const ChangePassword: NextPage<{token: string}> = ({token}) => {
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState('');
  const handleLoginSubmit = async (values, {setErrors}) => {
    const response = await changePassword({newPassword: values.newPassword, token});
    if (response.data?.changePassword.errors) {
      const errorMap = toErrorMap(response.data.changePassword.errors);
      if ('token' in errorMap) {
        setTokenError(errorMap.token);
      }
      setErrors(errorMap.changePassword);
    } else if (response.data?.changePassword.user) {
      router.push('/');
    }
  };
  return (
    <Wrapper>
      <Formik initialValues={{newPassword: ''}} onSubmit={handleLoginSubmit}>
        {({isSubmitting}) => (
          <Form>
            <InputField name="newPassword" placeholder="New Password" label="New Password" type="password" />
            {tokenError && (
              <Box>
                <Box mr={4} color="danger">
                  {tokenError}
                </Box>
                <NextLink href="/forgot-password">
                  <Link>Click here to get new token</Link>
                </NextLink>
              </Box>
            )}
            <Box mt={4}>
              <Button type="submit" colorScheme="teal" isLoading={isSubmitting}>
                Change Password
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

ChangePassword.getInitialProps = ({query}) => {
  return {
    token: query.token as string,
  };
};

export default withUrqlClient(createUrqlClient, {ssr: false})(ChangePassword);
