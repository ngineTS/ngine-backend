import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from './entities/user-role.entity';
import { User } from '../user/entities/user.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class UserRoleValidatorService {

  constructor(
    @InjectRepository(User)
    private _userRepository: Repository<User>
  ) {}

  async validUserRole(userId: string) {
    const user = await this._userRepository.findOne({
      where: { 
        id: userId,
        deletedDate: IsNull()
      }
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found.`);
    }

    if (user.name === 'guest') {
      throw new BadRequestException(`'Guest' user role cannot be modified.`);
    }
  }
}

