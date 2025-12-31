import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/domains/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Request, Response } from 'express';


@Injectable()
export class AuthService {

  constructor(private _jwtService: JwtService,
              @InjectRepository(User)
              private _userRepository: Repository<User>) {}


  async signIn(emailAddress: string, password: string): Promise<any> {
    const user = await this._userRepository.findOne({
        where: { emailAddress: emailAddress }
    });
    
    if(!user){
      throw new NotFoundException("This email address doesn't exist.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException("Your password is incorrect.");
    }

    const payload = { 
      sub: user.id,
      userEmail: user.emailAddress,
      userNavigationPermissions: []  
    };

    /* Return access token. */
    const accessToken = await this.getAccessToken(payload);
    return { access_token: accessToken };
  }

  /**
   * Get and verify token from request.
   * If it is valid then generate new access token
   * else throw UnauthorizedException.
   * @param req The request object of type Request from Express.
   * @returns The new access token.
   */
  async refresh(req: Request) {
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException();
    }

    const payload = await this._jwtService.verifyAsync(token, { 
      secret: process.env.JWT_SECRET 
    });
    if (!payload) {
      throw new UnauthorizedException();
    }
    
    const accessToken = await this.getAccessToken({
      sub: payload['sub'], 
      userEmail: payload['userEmail'],
      userNavigationPermissions: payload['userNavigationPermissions']
    });

    return { access_token: accessToken };
  }

  /**
   * Get new access token from Jwt.
   * @param payload Payload to pass to jwt sign in.
   * @returns A promise of the access token.
   */
  async getAccessToken(
    payload: {
      sub: string, 
      userEmail: string
      userNavigationPermissions: Array<{
        navigationId: string;
        permissionName: string;
      }>
    }
  ): Promise<string> {
    return this._jwtService.signAsync(payload);
  }

  /**
   * Extract Bearer token from request.
   * @param request The request.
   * @returns The token.
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
