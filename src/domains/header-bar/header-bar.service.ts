import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateHeaderBarDto } from './dto/create-header-bar.dto';
import { UpdateHeaderBarDto } from './dto/update-header-bar.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { HeaderBar } from './entities/header-bar.entity';
import { IsNull, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class HeaderBarService {

  constructor(@InjectRepository(HeaderBar)
              private headerBarRepository: Repository<HeaderBar>,
              @InjectRepository(User)
              private _userRepository: Repository<User>) {}

  /**
   * Save an header bar object.
   * @param createHeaderBarDto The header bar object to save.
   * @param userId The request user id.
   * @returns The header bar object saved.
   */
  async create(createHeaderBarDto: CreateHeaderBarDto, userId: string) {
    createHeaderBarDto["createdBy"] = userId;
    createHeaderBarDto["createdDate"] = new Date();
    createHeaderBarDto["updatedBy"] = userId;
    createHeaderBarDto["updatedDate"] = new Date();
    return await this.headerBarRepository.save(createHeaderBarDto);
  }

  /**
   * Update header bar.
   * @param id The id of the header bar to update.
   * @param updateHeaderBarDto The header bar properties to update.
   * @param userId The request user id.
   * @returns An UpdateResult type object.
   */
  async update(id: string, updateHeaderBarDto: UpdateHeaderBarDto, userId: string) {
    updateHeaderBarDto["updatedBy"] = userId;
    updateHeaderBarDto["updatedDate"] = new Date();

    const updateResult = await this.headerBarRepository.update(id, updateHeaderBarDto);

    if (updateResult.affected === 0) {
      throw new NotFoundException(`Id ${id} not found.`)
    }

    return updateResult;
  }

  /*
   * Delete header bar.
   * @param id The id of the header bar to delete.
   * @param userId The request user id.
   * @returns A DeleteResult type object.
   *
  /*async softDelete(id: string, userId: string) {
    const headerBar = await this.headerBarRepository.findOne({
      where: { id: id }
    });
    if (!headerBar) {
      throw new NotFoundException(`Id ${id} not found.`);
    }
    let navigationsToDelete = await this.navigationRepository.find({
      where: { parentId: headerBar?.navigationId }
    });
    for (let navigation of navigationsToDelete) {
      await this._navigationService.removeNavigation(navigation, userId);
    }

    //TODO: Soft Delete item instead. 
    // But before find a way to exclude soft deleted headerBarService in get nested navigation API.
    return await this.headerBarRepository.delete(id); 
  }*/

}
