import { APP_INTERCEPTOR } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { CurrentUserInterceptor } from './interceptors/current-user.interceptor';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) =>
        Promise.resolve({ email: 'example', password: 'example', id } as User),
      find: (email: string) =>
        Promise.resolve([{ id: 1, email, password: 'asdf' } as User]),
      //remove: (id: number) => {},
      //update: (id: number, attrs: Partial<User>) => {},
    };
    fakeAuthService = {
      //signup: () => {},
      signin: (email, password) => {
        return Promise.resolve({ email: email, password, id: 1 } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('asdf@asdf.com');

    expect(users.length).toBe(1);
    expect(users[0].email).toBe('asdf@asdf.com');
  });

  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findUser('1');

    expect(user).toBeDefined();
  });

  it('findUser throws an error if user with the given id is not found', async () => {
    fakeUsersService.findOne = () => Promise.resolve(null);
    expect.assertions(1);
    try {
      await controller.findUser('1');
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it('signin updates session object an returns users', async () => {
    const session = { userId: -10 };
    const user = await controller.signin(
      { email: 'example', password: 'any' },
      session,
    );

    expect(user.id).toBe(1);
    expect(session.userId).toBe(1);
  });
});
