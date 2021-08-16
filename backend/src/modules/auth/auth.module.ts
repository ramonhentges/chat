import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from 'src/controllers/auth/auth.controller';
import { User } from 'src/models/user.model';
import { AuthService } from '../../services/auth/auth.service';
import { LocalStrategy } from '../../strategys/local.strategy';
import { JwtStrategy } from 'src/strategys/jwt.strategy';
import { UserService } from 'src/services/user/user.service';
import { jwtSecretKey } from 'src/constants/constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      secret: jwtSecretKey,
      signOptions: { expiresIn: '7d' }
    })
  ],
  providers: [AuthService, UserService, LocalStrategy, JwtStrategy],
  exports: [AuthService, JwtModule],
  controllers: [AuthController]
})
export class AuthModule {}
