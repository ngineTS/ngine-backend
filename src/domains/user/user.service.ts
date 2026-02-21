import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PasswordRecovery } from 'src/core/password-recovery/entities/password-recovery.entity';
import { AuthService } from 'src/core/auth/auth.service';
import { UserRole } from '../user-role/entities/user-role.entity';
import { Role } from '../role/entities/role.entity';


@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private _userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private _userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private _roleRepository: Repository<Role>,
    @InjectRepository(PasswordRecovery)
    private _passwordRecoveryRepository: Repository<PasswordRecovery>,
    private _authService: AuthService
  ) { }

  /**
   * Create User.
   * 
   * @param createUserDto The user payload.
   * @returns Sign in response.
   * @description
   * 1. Validate email address
   * 2. Create hash password and save user.
   * 3. If first user of the app then assign him super admin role.
   * 4. Sign in and return access token.
   */
  async createUser(createUserDto: CreateUserDto) {
    /* 1. */
    createUserDto.emailAddress = createUserDto.emailAddress.toLowerCase();
    const userExists = await this._userRepository.findOne({
      where: { emailAddress: createUserDto.emailAddress }
    });
    if (userExists) {
      throw new BadRequestException('This email address already exists.');
    }

    /* 2. */
    const pass = createUserDto.password;
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(createUserDto.password, saltOrRounds);
    createUserDto.password = hash;
    const userSaved = await this._userRepository.save(createUserDto);

    /* 3. */
    const users = await this._userRepository.find({ 
      where: { name: Not('guest') },
      take: 1,
    });
    if (!users || users.length === 0) {
      const superAdminRole = await this._roleRepository.findOne({
        where: { name: 'super-admin' }
      });
      await this._userRoleRepository.save({
        userId: userSaved.id,
        roleId: superAdminRole?.id,
      })
    }

    /* 4. */
    return await this._authService.signIn(createUserDto.emailAddress, pass);
  }


  /**
   * Find all users and their roles. Exclude guest user.
   * 
   * @returns The array of users.
   */
  async findAll() {
    const users = await this._userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect(
      'user.userRoles',
      'userRoles',
      'userRoles.deletedDate IS NULL'
    )
    .where('user.deletedDate IS NULL')
    .andWhere('user.name != :guestName', { guestName: 'guest' })
    .getMany();

    return users;
  }

  /**
   * Update user properties.
   * 
   * @param id The user id.
   * @param updateUserDto The properties.
   * @returns A promise of UpdateResult.
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.emailAddress || updateUserDto.password) {
      throw new BadRequestException('Well tried ;)');
    }

    const updateResult = await this._userRepository.update(id, updateUserDto);
    if (updateResult.affected === 0) {
      throw new NotFoundException(`User id ${id} not found.`);
    }

    return updateResult;
  }

  /**
   * Remove User and associated user roles.
   * 
   * @param id The id of the user to remove.
   * @param userId The user id from token request (used for audit).
   * @returns The total number of records deleted (user + user roles).
   */
  async remove(id: string, userId: string) {
    let removedTotal = 0;
    const softDeleteUserResponse = await this._userRepository.update(id, {
      deletedDate: new Date(),
      deletedBy: userId
    })

    if (softDeleteUserResponse.affected === 0) {
      throw new NotFoundException(`User id ${id} not found.`)
    }

    const userRolesToSoftDelete = await this._userRoleRepository.find({
      where: {userId: id}
    });
    for(let userRole of userRolesToSoftDelete) {
      userRole.deletedDate = new Date(),
      userRole.deletedBy = userId
    }
    removedTotal = removedTotal 
      + (await this._userRoleRepository.save(userRolesToSoftDelete)).length;

    return removedTotal + softDeleteUserResponse.affected!;
  }

  /**
   * Change user password.
   * 
   * @param passwordChangeDto The passwordChange dto.
   */
  async changeUserPassword(passwordChangeDto: any) {
    const passwordRecoveryRecord = await this._passwordRecoveryRepository.findOne({
      where: {token: passwordChangeDto.token}
    });
    
    if (passwordRecoveryRecord) {
      const fiveMinutes = 5*60*1000;
      
      if (new Date().getTime() - passwordRecoveryRecord.createdDate.getTime() < fiveMinutes) {
        
        if (passwordChangeDto.newPassword === passwordChangeDto.repeatPassword) {
          const saltOrRounds = 10;
          const hash = await bcrypt.hash(passwordChangeDto.newPassword, saltOrRounds);
          const user = await this._userRepository.findOne({
            where: { 
              emailAddress: passwordRecoveryRecord.emailAddress
            }
          });
          if (!user) {
            throw new NotFoundException();
          }
          await this._passwordRecoveryRepository.delete({ token: passwordChangeDto.token });
          return await this._userRepository.update(user.id, { password: hash });
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
