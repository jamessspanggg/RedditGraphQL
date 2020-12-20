import {Box, Button, Link} from '@chakra-ui/react';
import {Formik, Form} from 'formik';
import {withUrqlClient} from 'next-urql';
import {useRouter} from 'next/router';
import React from 'react';
import {useState} from 'react';
import {createUrqlClient} from '../../utils/createUrqlClient';
import {InputField} from '../components/InputField';
import {Wrapper} from '../components/Wrapper';
import {useForgotPasswordMutation} from '../generated/graphql';

interface Props {}

const ForgotPassword: React.FC<Props> = () => {
  const [, forgotPassword] = useForgotPasswordMutation(); // useMutation allows you to execute graphql queries at the client
  const [complete, setComplete] = useState(false);
  const router = useRouter();
  const handleForgotPasswordSubmit = async (values, {setErrors}) => {
    await forgotPassword(values);
    setComplete(true);
  };
  return (
    <Wrapper>
      <Formik initialValues={{email: ''}} onSubmit={handleForgotPasswordSubmit}>
        {({isSubmitting}) => {
          return complete ? (
            <Box>If an account with that email exists, we have sent you an email</Box>
          ) : (
            <Form>
              <InputField name="email" placeholder="Email" label="Email" />
              <Box mt={4}>
                <Button mr={4} type="submit" colorScheme="teal" isLoading={isSubmitting}>
                  Forgot password
                </Button>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient, {ssr: false})(ForgotPassword);
