import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      email: dto.email,
      password: hashed,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    const token = this.sign(user.id, user.email, user.role);
    return { accessToken: token, user: this.sanitize(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const token = this.sign(user.id, user.email, user.role);
    return { accessToken: token, user: this.sanitize(user) };
  }

  private sign(id: number, email: string, role: string) {
    return this.jwtService.sign({ sub: id, email, role });
  }

  private sanitize(user: { id: number; email: string; firstName: string; lastName: string; role: string }) {
    const { id, email, firstName, lastName, role } = user;
    return { id, email, firstName, lastName, role };
  }
}
