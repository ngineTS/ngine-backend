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
import { StripePaymentService } from 'src/stripe-payment/stripe-payment.service';


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
    private _authService: AuthService,
    private _stripePaymentService: StripePaymentService
  ) { }

  /**
   * Create user.
   * 
   * 1. Validate email address
   * 2. Create hash password and save user.
   * 3. Assign role to user up to the different scenarios.
   * 4. Return checkout url or sign in response.
   * 
   * @param createUserDto The user payload.
   * @returns Sign in response.
   * @throws {BadRequestException} If role is not assigned to any pack.
   */
  async createUser(createUserDto: CreateUserDto) {
    /* 1. Validate email address. */
    await this.validateEmailAddress(createUserDto.emailAddress);

    /* 2. Create hash password and save user. */
    const pass = createUserDto.password;
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(createUserDto.password, saltOrRounds);
    createUserDto.password = hash;
    createUserDto.emailAddress = createUserDto.emailAddress.toLowerCase();
    const userSaved = await this._userRepository.save(createUserDto);
    
    /* 3. Assign role to the user. */
    const resp = await this.assignRoleToUser(userSaved.id, createUserDto.roleId);

    /* 4. */
    if (resp?.url) {
      return resp;
    }
    return this._authService.signIn(createUserDto.emailAddress, pass);
  }

  /**
   * Validate email address.
   * 
   * @param emailAddress The email address to validate.
   * @throws {BadRequestException} If email address already exists.
   */
  async validateEmailAddress(emailAddress: string) {
    emailAddress = emailAddress.toLowerCase();

    const userExists = await this._userRepository.findOne({
      where: { emailAddress: emailAddress }
    });

    if (userExists) {
      throw new BadRequestException('This email address already exists.');
    }
  }

  /**
   * Assign super admin role to user if it is the first user of the app.
   * 
   * @param userId the user id.
   */
  async assignAdminRoleIfFirstUser(userId: string) {
    const users = await this._userRepository.find({ 
      where: { 
        name: Not('guest'),
        id: Not(userId)
      },
      take: 1,
    });
    
    if (!users || users.length === 0) {
      const superAdminRole = await this._roleRepository.findOne({
        where: { name: 'super-admin' }
      });

      await this._userRoleRepository.save({
        userId: userId,
        roleId: superAdminRole?.id,
      });
    }
  }

  /**
   * Assign role to the user.
   * If payment is required then don't assign role, instead return checkout session url.
   * 
   * Process:
   * - CASE 1: User is first user of the app.
   * - CASE 2: If role is associated to a free pack -> assign role to user.
   * - CASE 3: If role is associated to a paid pack -> create stripe checkout session.
   * - CASE 4: No role is passed -> assign guest role to the user.
   * 
   * @param userId The id of the user created.
   * @param roleId The id of the role to assign.
   * @returns the checkout url if case 3, else null. 
   * @throws {BadRequestException} If role is not assigned to any pack.
   * @throws {NotFoundException} If guest role is not found.
   */
  async assignRoleToUser(userId: string, roleId: string | undefined) {
    let checkoutUrl: { url: string | null } | null = null;

    /* CASE 1 */
    await this.assignAdminRoleIfFirstUser(userId);
    
    if (roleId) {
      const authPacks = await this._authService.getAuthPacks();
      const associatedPack = authPacks.find(pack => pack.roleId === roleId);

      if (!associatedPack) {
        throw new BadRequestException(`Role id ${roleId} This role is not assigned to any pack`);
      }

      /* CASE 2 */
      if (associatedPack.isFree || associatedPack.price === 0) {
        await this._userRoleRepository.save({
          userId: userId,
          roleId: roleId,
        });
      }
      /* CASE 3 */ 
      else {
        checkoutUrl = await this._stripePaymentService.createCheckoutSession(
          associatedPack.stripePriceId,
          associatedPack.roleId,
          userId
        );
      }
    }
    /* CASE 4 */
    else {
      const guestRole = await this._roleRepository.findOne({
        where: { name: 'guest' }
      });

      if (!guestRole) {
        throw new NotFoundException('No guest role found.');
      }

      await this._userRoleRepository.save({
        userId: userId,
        roleId: guestRole?.id,
      });
    }

    return checkoutUrl;
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
   * Find the authenticated user and active roles.
   *
   * @param userId The user id from the authentication token.
   * @returns The authenticated user without its password.
   */
  async findCurrentUser(userId: string) {
    const user = await this._userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect(
        'user.userRoles',
        'userRoles',
        'userRoles.deletedDate IS NULL'
      )
      .leftJoinAndSelect(
        'userRoles.role',
        'role',
        'role.deletedDate IS NULL'
      )
      .where('user.id = :userId', { userId })
      .andWhere('user.deletedDate IS NULL')
      .getOne();

    if (!user) {
      throw new NotFoundException(`User id ${userId} not found.`);
    }

    const { password, ...userInfo } = user;
    return userInfo;
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
