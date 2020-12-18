import {Button, FormControl, FormLabel, FormErrorMessage, Input, Box} from '@chakra-ui/react';
import React from 'react';
import {Form, Formik} from 'formik';
import {Wrapper} from '../components/Wrapper';
import {InputField} from '../components/InputField';
import {useRegisterMutation} from '../generated/graphql';
import {toErrorMap} from '../../utils/toErrorMap';
import {useRouter} from 'next/router';

interface Props {}

const Register: React.FC<Props> = () => {
  const [, register] = useRegisterMutation(); // useMutation allows you to execute graphql queries at the client
  const router = useRouter();
  const handleRegisterSubmit = async (values, {setErrors}) => {
    const response = await register(values);
    if (response.data?.register.errors) {
      setErrors(toErrorMap(response.data.register.errors));
    } else if (response.data?.register.user) {
      router.push('/');
    }
  };
  return (
    <Wrapper>
      <Formik initialValues={{username: '', password: ''}} onSubmit={handleRegisterSubmit}>
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
