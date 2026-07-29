import { Body, Controller, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { ContainerLayoutService } from './container-layout.service';
import { UpdateContainerLayoutDto } from './dto/update-container-layout.dto';
import { containerLayoutValidatorService } from './container-layout-validator.service';
import { NavigationPermissions } from 'src/core/models/navigation-permissions.interface';
import { UserNavigationPermissions } from 'src/core/decorators/user-navigation-permissions.decorator';
import { NavigationService } from '../navigation/navigation.service';

@Controller('container-layout')
export class ContainerLayoutController {
  
  constructor(
    private readonly _containerLayoutService: ContainerLayoutService,
    private readonly _containerLayoutValidatorService: containerLayoutValidatorService,
    private readonly _navigationService: NavigationService
  ) {}

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateContainerLayoutDto: UpdateContainerLayoutDto,
    @UserNavigationPermissions() userNavigationPermissions: NavigationPermissions
  ) {
    const navigationId = await this._containerLayoutValidatorService.validPermission(id, userNavigationPermissions);
    const updateResult = await this._containerLayoutService.update(id, updateContainerLayoutDto);
    await this._navigationService.markDirty(navigationId, ['containerLayout']);
    return updateResult;
  }
}
