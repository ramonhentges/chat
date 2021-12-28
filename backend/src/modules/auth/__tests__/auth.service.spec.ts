import { createMock } from '@golevelup/ts-jest';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '@/modules/user/user.service';
import UserBuilder from '@/__test__/builder/user-builder';
import { AuthService } from '../auth.service';

describe('AuthService', () => {
  let sut: AuthService;
  const mockUserService = createMock<UserService>();
  let generatedToken: { accessToken: string };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'jwtSecretKey',
          signOptions: { expiresIn: '7d' }
        })
      ],
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService }
      ]
    }).compile();

    sut = module.get<AuthService>(AuthService);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('When initialize auth service', () => {
    it('should be defined', () => {
      expect(sut).toBeDefined();
    });
  });

  describe('When login', () => {
    it('should return access token', async () => {
      const user = UserBuilder.aUser().build();
      mockUserService.login.mockResolvedValueOnce(user);
      const result = await sut.login(user);
      expect(result).toHaveProperty('accessToken');
      generatedToken = result;
    });
  });

  describe('When validate token', () =>{
    it('should return payload data',async () => {
      const user = UserBuilder.aUser().build();
      const result = await sut.validate(generatedToken.accessToken);
      expect(result).toHaveProperty('id', user.id)
      expect(result).toHaveProperty('username', user.username)
    })

    it('should return false as invalid token',async () => {
      const result = await sut.validate('invalidToken');
      expect(result).toBeFalsy()
    })
  })

  describe('When validate user', () =>{
    it('should return the user',async () => {
      const user = UserBuilder.aUser().build();
      mockUserService.login.mockResolvedValueOnce(user)
      const result = await sut.validateUser(user.username, '12345678');
      expect(result).toStrictEqual(user)
    })
  })
});
