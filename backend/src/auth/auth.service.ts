import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { RegisterDto, LoginDto } from './dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, role, masjidId } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if this is the first user (becomes SUPER_ADMIN)
    const userCount = await this.prisma.user.count();
    const userRole = userCount === 0 ? UserRole.SUPER_ADMIN : (role || UserRole.MASJID_ADMIN);

    // Validate masjidId if not super admin
    if (userRole !== UserRole.SUPER_ADMIN && !masjidId) {
      throw new BadRequestException('masjidId is required for non-super admin users');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: userRole,
        masjidId: userRole === UserRole.SUPER_ADMIN ? null : masjidId,
      },
      include: {
        masjid: true,
      },
    });

    // Generate token
    const token = this.generateToken(user.id, user.email, user.role);

    // return {
    //   success: true,
    //   data: {
    //     user: this.sanitizeUser(user),
    //     token,
    //   },
    // };
    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        masjid: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user.id, user.email, user.role);

    // return {
    //   success: true,
    //   data: {
    //     user: this.sanitizeUser(user),
    //     token,
    //   },
    // };
    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        masjid: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      success: true,
      data: this.sanitizeUser(user),
    };
  }

  async refreshToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      success: true,
      data: { token },
    };
  }

  private generateToken(userId: string, email: string, role: UserRole): string {
    const payload = {
      sub: userId,
      email,
      role,
    };

    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
