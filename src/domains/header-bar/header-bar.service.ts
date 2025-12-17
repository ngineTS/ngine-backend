import { Injectable } from '@nestjs/common';
import { CreateHeaderBarDto } from './dto/create-header-bar.dto';
import { UpdateHeaderBarDto } from './dto/update-header-bar.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { HeaderBar } from './entities/header-bar.entity';
import { IsNull, Repository } from 'typeorm';
import { Navigation } from '../navigation/entities/navigation.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class HeaderBarService {

  constructor(@InjectRepository(HeaderBar)
              private headerBarRepository: Repository<HeaderBar>,
              @InjectRepository(Navigation)
              private navigationRepository: Repository<Navigation>,
              @InjectRepository(User)
              private _userRepository: Repository<User>) {}

  async create(createHeaderBarDto: CreateHeaderBarDto, userId: string) {
    createHeaderBarDto["createdBy"] = userId;
    createHeaderBarDto["createdDate"] = new Date();
    createHeaderBarDto["updatedBy"] = userId;
    createHeaderBarDto["updatedDate"] = new Date();
    return await this.headerBarRepository.save(createHeaderBarDto);
  }

  async findMainHeaderBar(userId: string) {
    /* get main header */
    const mainHeaderBar = await this.headerBarRepository.findOne({
      where: { 
        navigationId: IsNull(),
        deletedBy: IsNull(),
      }
    });
    /* get user role - 'All navigation' permission only */
    const userAllNavigationsPermission = await this._userRepository.findOne({
      relations: [
        'userRoles',
        'userRoles.role',
        'userRoles.role.roleNavigationPermissions',
        'userRoles.role.roleNavigationPermissions.navigation',
        'userRoles.role.roleNavigationPermissions.permission',
      ],
      where: {
        id: userId,
        deletedDate: IsNull(),
        userRoles: {
          deletedDate: IsNull(),
          role: {
            deletedDate: IsNull(),
            roleNavigationPermissions: {
              navigationId: '00000000-0000-0000-0000-000000000000',
              deletedDate: IsNull(),
            }
          }
        }
      }
    });
    /* assign permissionName property to mainHeader */
    if (mainHeaderBar && userAllNavigationsPermission) {
      mainHeaderBar["permissionName"] =
        userAllNavigationsPermission.userRoles[0].role.roleNavigationPermissions[0].permission.name;
    }
    
    return mainHeaderBar;
  }

  async update(id: string, updateHeaderBarDto: UpdateHeaderBarDto) {
    return await this.headerBarRepository.update(id, updateHeaderBarDto);
  }

  async softDelete(id: string, userId: string) {
    const headerBar = await this.headerBarRepository.findOne({
      where: { id: id }
    });
    let navigstionsToDelete = await this.navigationRepository.find({
      where: { parentId: headerBar?.navigationId }
    });
    for (let navigation of navigstionsToDelete) {
      navigation.deletedBy = userId;
      navigation.deletedDate = new Date();
    }
    await this.navigationRepository.save(navigstionsToDelete);
    //TODO: Soft Delete item instead. 
    // But before find a way to exclude soft deleted headerBarService in get nested navigation API.
    return await this.headerBarRepository.delete(id); 
  }
}
