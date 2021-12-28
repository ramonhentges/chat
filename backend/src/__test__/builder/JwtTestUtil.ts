import { JwsTokenDto } from '@/modules/auth/dto/jws-token.dto';

export default class JWTTestUtil {
  static giveAValidJwtTokenDto(): JwsTokenDto {
    const jwt: JwsTokenDto = {
      id: '02c85f68-5e92-46fb-a12c-bf43d2d84d7b',
      username: 'test'
    };
    return jwt;
  }
}
