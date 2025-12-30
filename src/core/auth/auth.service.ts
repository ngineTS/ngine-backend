import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/domains/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import { NavigationService } from 'src/domains/navigation/navigation.service';
import { Navigation } from 'src/domains/navigation/entities/navigation.entity';
import { RoleService } from 'src/domains/role/role.service';


@Injectable()
export class AuthService {

  constructor(private _jwtService: JwtService,
              @InjectRepository(User)
              private _userRepository: Repository<User>,
              private _roleService: RoleService,
              private _navigationService: NavigationService) {}


  async signIn(emailAddress: string, password: string, res: Response): Promise<any> {
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

    const userNavigationPermissions: Array<
      { 
        navigationId: string;
        permissionName: string;
      }> = [];

    const navigations = await this._navigationService.findNestedNavigations(user.id);
    this.recursivelyRetrieveNavigationPermissionCouple(navigations, userNavigationPermissions);

    const allNavigationPermissionsAccess = await this._roleService.getUserRoleNavigationPermissionAllNavigationsOnly(user.id);
    if (allNavigationPermissionsAccess) {
      userNavigationPermissions.push({
        navigationId: allNavigationPermissionsAccess.navigationId,
        permissionName: allNavigationPermissionsAccess.permission.name
      })
    }

    const payload = { 
      sub: user.id,
      userEmail: user.emailAddress,
      userNavigationPermissions: userNavigationPermissions  
    };

    /* Setup refresh token.*/
    const refreshToken = await this.getRefreshToken(payload);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false, //TO CHANGE IN PROD
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000
    });

    /* Return access token. */
    const accessToken = await this.getAccessToken(payload);
    return { access_token: accessToken };
  }

  /**
   * Get and verify refresh token from request.
   * If it is valid then generate new access token
   * else throw UnauthorizedException.
   * @param req The request object of type Request from Express.
   * @returns The new access token.
   */
  async refresh(req: Request) {
    const refreshToken = req.cookies['refresh_token'];
    const payload = await this._jwtService.verifyAsync(refreshToken, { 
      secret: process.env.JWT_REFRESH_SECRET 
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
   * Get new refresh token from Jwt.
   * @param payload Payload to pass to jwt sign in.
   * @returns A promise of the refresh token.
   */
  async getRefreshToken(
    payload: {
      sub: string, 
      userEmail: string,
      userNavigationPermissions: Array<{
        navigationId: string;
        permissionName: string;
      }>
    }
  ): Promise<string> {
    return this._jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET, expiresIn: '1d' 
    });
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


  recursivelyRetrieveNavigationPermissionCouple(
    navigations: Array<Navigation>,
    userNavigationPermissionsArray: Array<{
      navigationId: string;
      permissionName: string;
    }>
  ) {
    for (const navigation of navigations) {
      userNavigationPermissionsArray.push({
        navigationId: navigation.id,
        permissionName: navigation['permissionName']
      });
      if (navigation.children && navigation.children.length > 0) {
        this.recursivelyRetrieveNavigationPermissionCouple(navigation.children, userNavigationPermissionsArray);
      }
    }
  }

}
