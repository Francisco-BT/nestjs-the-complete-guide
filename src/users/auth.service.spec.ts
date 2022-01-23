import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      find: (email) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          email,
          password,
          id: Math.floor(Math.random() * 9999),
        } as User;
        users.push(user);

        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('test@mail.com', '123456');

    expect(user.password).not.toBe('123456');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an email if users signs up with email that is in use', async () => {
    expect.assertions(1);
    await service.signup('test@mail.com', '12345');
    try {
      await service.signup('test@mail.com', '12345');
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it('throws if signin is called with an unused email', async () => {
    expect.assertions(1);
    try {
      await service.signin('a', '');
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  it('throws if an invalid password is provided', async () => {
    expect.assertions(1);
    await service.signup('asdf@asdf.com', 'some-password');
    try {
      await service.signin('asdf@asdf.com', 'password');
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  it('returns a user if correct password is provided', async () => {
    expect.assertions(1);
    await service.signup('asdf@asdf.com', 'mypassword');
    const user = await service.signin('asdf@asdf.com', 'mypassword');

    expect(user).toBeDefined();
  });
});
