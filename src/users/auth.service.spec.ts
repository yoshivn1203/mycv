import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;
  beforeEach(async () => {
    //create fake copy of users service

    // BASIC FAKE SERVICE STILL WORK

    // fakeUsersService = {
    //   find: () => Promise.resolve([]),
    //   create: (email: string, password: string) =>
    //     Promise.resolve({ id: 1, email, password } as User),
    // };

    // BETTER FAKE SERVICE

    const users: User[] = [];

    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = { id: Math.random() * 999999, email, password } as User;

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

  it('can create an user with hashed and salted password', async () => {
    const user = await service.signup('asdad@mail.com', 'asdaqwe');
    expect(user.password).not.toBe('asdaqwe');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throw an error if user sign up with email that is in use', async () => {
    // can replace the function below with a simple signup call since we use a better
    // fake service already, but I keep it here just for reference
    fakeUsersService.find = () =>
      Promise.resolve([{ id: 1, email: 'a', password: 'a' } as User]);

    await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throw an error if user sign in with unused email', async () => {
    await expect(service.signin('asaaqqwedf@asdf.com', 'asdf')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throw an error if wrong password is provided when sign in', async () => {
    // can replace the function below with a simple signup call since we use a better
    // fake service already, but I keep it here just for reference
    fakeUsersService.find = () =>
      Promise.resolve([{ id: 1, email: 'a', password: 'a' } as User]);

    await expect(service.signin('a', 'asdasd')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('return a user if correct password is provided', async () => {
    await service.signup('valid@mail.com', 'validPassword');
    const user = await service.signin('valid@mail.com', 'validPassword');
    expect(user).toBeDefined();
  });
});
