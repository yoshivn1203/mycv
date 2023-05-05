import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUserService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUserService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'asdasd@mail.com',
          password: 'asd',
        } as User);
      },
      find: (email: string) => {
        return Promise.resolve([{ id: 1, email, password: 'asdasd' } as User]);
      },
      // remove: () => {},
      // update: () => {},
    };
    fakeAuthService = {
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
      // signup: ()=>{}
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUserService,
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

  it('findAllUsers return a list of users with the given email', async () => {
    const users = await controller.findAllUsers('asdasd@mail.com');

    expect(users.length).toBe(1);
    expect(users[0].email).toBe('asdasd@mail.com');
  });

  it('findUser return a user with the given id', async () => {
    const user = await controller.findUser('1');

    expect(user).toBeDefined();
  });

  it('findUser throw an error with the given id not found', async () => {
    fakeUserService.findOne = () => Promise.resolve(null);
    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });

  it('signin updates session object and return user', async () => {
    const session = { userId: -10 };
    const user = await controller.signin(
      {
        email: 'asdasd@mail.com',
        password: 'asdasd',
      },
      session,
    );
    expect(user.id).toBe(1);
    expect(session.userId).toBe(1);
  });
});
