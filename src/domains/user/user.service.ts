import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PasswordRecovery } from 'src/core/password-recovery/entities/password-recovery.entity';
import { AuthService } from 'src/core/auth/auth.service';
import { Response } from 'express';
import { UserRole } from '../user-role/entities/user-role.entity';
import { Role } from '../role/entities/role.entity';


@Injectable()
export class UserService {

  constructor(@InjectRepository(User)
              private userRepository: Repository<User>,
              @InjectRepository(UserRole)
              private userRoleRepository: Repository<UserRole>,
              @InjectRepository(Role)
              private roleRepository: Repository<Role>,
              @InjectRepository(PasswordRecovery)
              private passwordRecoveryRepository: Repository<PasswordRecovery>,
              private authService: AuthService) { }


  async createUser(createUserDto: CreateUserDto, res: Response) {
    const pass = createUserDto.password;
    
    //create encrypted user password
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(createUserDto.password, saltOrRounds);
    createUserDto.password = hash;

    //Check if user table is empty (i.e no user have registered yet)
    //This is used to assign super admin to first user
    const users = await this.userRepository.find({ take: 1 });

    //save user
    createUserDto["emailAddress"] = createUserDto["emailAddress"].toLowerCase();
    const userSaved = await this.userRepository.save(createUserDto);

    //if first user then assign super admin role
    if (!users || users.length === 0) {
      const superAdminRole = await this.roleRepository.findOne({
        where: { name: 'super-admin' }
      });
      await this.userRoleRepository.save({
        userId: userSaved.id,
        roleId: superAdminRole?.id,
      })
    }
    return await this.authService.signIn(createUserDto.emailAddress, pass, res);
  }


  async findAll() {
    const users = await this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect(
      'user.userRoles',
      'userRoles',
      'userRoles.deletedDate IS NULL'
    )
    .where('user.deletedDate IS NULL')
    .getMany();

    return users;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const updateResult = await this.userRepository.update(id, updateUserDto);

    if (updateResult.affected === 0) {
      throw new NotFoundException(`User id ${id} not found.`)
    }

    return updateResult;
  }

  async remove(id: string, userId: string) {
    let removedTotal = 0;
    const softDeleteUserResponse = await this.userRepository.update(id, {
      deletedDate: new Date(),
      deletedBy: userId
    })

    if (softDeleteUserResponse.affected === 0) {
      throw new NotFoundException(`User id ${id} not found.`)
    }

    const userRolesToSoftDelete = await this.userRoleRepository.find({
      where: {userId: id}
    });
    for(let userRole of userRolesToSoftDelete) {
      userRole.deletedDate = new Date(),
      userRole.deletedBy = userId
    }
    removedTotal = removedTotal 
      + (await this.userRoleRepository.save(userRolesToSoftDelete)).length;

    return removedTotal + softDeleteUserResponse.affected!;
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
          await this.passwordRecoveryRepository.delete({ token: passwordChangeDto.token });
          return await this.userRepository.update(user.id, { password: hash });
        }
        else {
          throw new BadRequestException("Passwords don't match.");
        }

      }
      else {
        throw new BadRequestException("This link has expired.");
      }

    }
    else {
      throw new NotFoundException("This link has expired.");
    }
  }
}
