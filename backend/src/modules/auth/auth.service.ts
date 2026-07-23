import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(username: string, password: string) {
    const adminUser = process.env.AUTH_USER || 'admin';
    const adminPass = process.env.AUTH_PASS || 'admin123';

    if (username !== adminUser || password !== adminPass) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { sub: username, email: `${username}@healthapp.com`, role: 'admin' };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
