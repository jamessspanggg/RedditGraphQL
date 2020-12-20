import {UsernamePasswordInput} from 'src/resolvers/UsernamePasswordInput';

export const validateRegister = (options: UsernamePasswordInput) => {
  const {email, username, password} = options;
  if (username.length <= 2) {
    return [
      {
        field: 'username',
        message: 'username must be longer than 2',
      },
    ];
  }

  if (username.includes('@')) {
    return [
      {
        field: 'username',
        message: 'username cannot include @ sign',
      },
    ];
  }

  if (!email.includes('@')) {
    return [
      {
        field: 'email',
        message: 'invalid email',
      },
    ];
  }

  if (password.length <= 2) {
    return [
      {
        field: 'password',
        message: 'password must be longer than 2',
      },
    ];
  }

  return null;
};
