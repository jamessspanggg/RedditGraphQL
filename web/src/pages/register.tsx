import {Button, FormControl, FormLabel, FormErrorMessage, Input, Box} from '@chakra-ui/react';
import React from 'react';
import {Form, Formik} from 'formik';
import {Wrapper} from '../components/Wrapper';
import {InputField} from '../components/InputField';
import {useMutation} from 'urql';

interface Props {}

const REGISTER_MUTATION = `
mutation Register($username: String!, $password: String!) {
  register(options: { username: $username, password: $password}) {
    errors {
      field
      message
    }
    user {
      id
      username
    }
  }
}
`;

const Register: React.FC<Props> = () => {
  const [, register] = useMutation(REGISTER_MUTATION); // useMutation allows you to execute graphql queries at the client
  return (
    <Wrapper>
      <Formik
        initialValues={{username: '', password: ''}}
        onSubmit={async (values) => {
          const response = await register(values);
          console.log(response);
        }}
      >
        {({isSubmitting}) => (
          <Form>
            <InputField name="username" placeholder="Username" label="Username" />
            <Box mt={4}>
              <InputField name="password" placeholder="Password" label="Password" type="password" />
            </Box>
            <Box mt={4}>
              <Button type="submit" colorScheme="teal" isLoading={isSubmitting}>
                Register
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
