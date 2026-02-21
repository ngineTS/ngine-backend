import { Controller, Post, Body, Patch, Param, ParseArrayPipe } from '@nestjs/common';
import { CustomFormInputService } from './custom-form-input.service';
import { CreateCustomFormInputDto } from './dto/create-custom-form-input.dto';
import { CustomTableValidatorService } from '../custom-table/custom-table-validator.service';
import { UserNavigationPermissions } from 'src/core/decorators/user-navigation-permissions.decorator';
import { NavigationPermissions } from 'src/core/models/navigation-permissions.interface';

@Controller('custom-form-input')
export class CustomFormInputController {

  constructor(
    private readonly _customFormInputService: CustomFormInputService,
    private readonly _customTableValidatorService: CustomTableValidatorService
  ) {}

  @Post(':tableName')
  async create(
    @Param('tableName') tableName: string,
    @Body(new ParseArrayPipe({ items: CreateCustomFormInputDto }))
    createCustomFormInputDto: Array<CreateCustomFormInputDto>,
    @UserNavigationPermissions() userNavigationPermissions: NavigationPermissions
  ) {
    await this._customTableValidatorService.validPermission(tableName, 'add', userNavigationPermissions);
    return this._customFormInputService.create(
      createCustomFormInputDto,
      tableName,
    );
  }

  @Patch(':tableName')
  async update(
    @Param('tableName') tableName: string,
    @Body(new ParseArrayPipe({ items: CreateCustomFormInputDto }))
    createCustomFormInputDto: Array<CreateCustomFormInputDto>,
    @UserNavigationPermissions() userNavigationPermissions: NavigationPermissions
  ) {
    await this._customTableValidatorService.validPermission(tableName, 'edit', userNavigationPermissions);
    return this._customFormInputService.update(
      tableName,
      createCustomFormInputDto,
    );
  }
}
