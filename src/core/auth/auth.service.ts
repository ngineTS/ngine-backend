import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/domains/user/entities/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class AuthService {

  constructor(private jwtService: JwtService,
              @InjectRepository(User)
              private userRepository: Repository<User>) {}


  async signIn(emailAddress: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
        where: { emailAddress: emailAddress }
    });

    if(!user){
      throw new NotFoundException("This email address doesn't exists.");
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException("Your password is incorrect.");
    }
    
    const payload = { sub: user.id, userEmail: user.emailAddress };
    return { access_token: await this.jwtService.signAsync(payload) };
  }

}
