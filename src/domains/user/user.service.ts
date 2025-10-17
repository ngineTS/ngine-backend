import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PasswordRecovery } from 'src/core/password-recovery/entities/password-recovery.entity';
import { AuthService } from 'src/core/auth/auth.service';


@Injectable()
export class UserService {

  constructor(@InjectRepository(User)
              private userRepository: Repository<User>,
              @InjectRepository(PasswordRecovery)
              private passwordRecoveryRepository: Repository<PasswordRecovery>,
              private authService: AuthService) { }


  async createUser(createUserDto: CreateUserDto) {
    const pass = createUserDto.password;
    
    //create encrypted user password
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(createUserDto.password, saltOrRounds);
    createUserDto.password = hash;

    //save user
    const userSaved = await this.userRepository.save(createUserDto);

    return await this.authService.signIn(createUserDto.emailAddress, pass);
  }


  findAll() {
    return `This action returns all user`;
  }

  async findUserData(userId: string){
    return await this.userRepository.findOne({
      where: {
        id: userId
      }
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async doesEmailAddressAlreadyExists(emailAddress: string): Promise<boolean> {
    if((await this.userRepository.find({
        where: {emailAddress: emailAddress}
    })).length > 0){
      return true;
    }
    return false;
  }

  async changeUserPassword(passwordChangeDto: any) {
    const passwordRecoveryRecord = await this.passwordRecoveryRepository.findOne({
      where: {token: passwordChangeDto.token}
    });
    
    if (passwordRecoveryRecord) {
      const fiveMinutes = 5*60*1000;
      
      if (new Date().getTime() - passwordRecoveryRecord.createdDate.getTime() < fiveMinutes) {
        
        if (passwordChangeDto.newPassword === passwordChangeDto.repeatPassword) {
          const saltOrRounds = 10;
          const hash = await bcrypt.hash(passwordChangeDto.newPassword, saltOrRounds);
          const user = await this.userRepository.findOne({
            where: { 
              emailAddress: passwordRecoveryRecord.emailAddress
            }
          });
          if (!user) {
            throw new NotFoundException();
          }
          await this.passwordRecoveryRepository.delete({token: passwordChangeDto.token});
          return await this.userRepository.update(user.id, {password: hash});
        }
        else {
          throw new BadRequestException("Passwords don't match.");
        }

      }
      else {
        return JSON.stringify('This link has expired.');
      }

    }
    else {
      return  JSON.stringify('This link has expired.');
    }
  }
}
