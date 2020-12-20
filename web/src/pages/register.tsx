import {Box, Button} from '@chakra-ui/react';
import {Form, Formik} from 'formik';
import {withUrqlClient} from 'next-urql';
import {useRouter} from 'next/router';
import React from 'react';
import {createUrqlClient} from '../../utils/createUrqlClient';
import {toErrorMap} from '../../utils/toErrorMap';
import {InputField} from '../components/InputField';
import {Wrapper} from '../components/Wrapper';
import {useRegisterMutation} from '../generated/graphql';

interface Props {}

const Register: React.FC<Props> = () => {
  const [, register] = useRegisterMutation(); // useMutation allows you to execute graphql queries at the client
  const router = useRouter();
  const handleRegisterSubmit = async (values, {setErrors}) => {
    const response = await register({options: values});
    if (response.data?.register.errors) {
      setErrors(toErrorMap(response.data.register.errors));
    } else if (response.data?.register.user) {
      router.push('/');
    }
  };
  return (
    <Wrapper>
      <Formik initialValues={{email: '', username: '', password: ''}} onSubmit={handleRegisterSubmit}>
        {({isSubmitting}) => (
          <Form>
            <InputField name="username" placeholder="Username" label="Username" />
            <Box mt={4}>
              <InputField name="email" placeholder="Email" label="Email" type="email" />
            </Box>
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

export default withUrqlClient(createUrqlClient, {ssr: false})(Register);
