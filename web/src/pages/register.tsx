import {Button, FormControl, FormLabel, FormErrorMessage, Input, Box} from '@chakra-ui/react';
import React from 'react';
import {Form, Formik} from 'formik';
import {Wrapper} from '../components/Wrapper';
import {InputField} from '../components/InputField';

interface Props {}

const Register: React.FC<Props> = () => {
  return (
    <Wrapper>
      <Formik initialValues={{username: '', password: ''}} onSubmit={(values) => console.log(values)}>
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
