import { Body, Controller, Param, ParseUUIDPipe, Patch, Request } from '@nestjs/common';
import { ContainerLayoutService } from './container-layout.service';
import { UpdateContainerLayoutDto } from './dto/update-container-layout.dto';
import { containerLayoutValidatorService } from './container-layout-validator.service';
import { NavigationPermissions } from 'src/core/models/navigation-permissions.interface';
import { UserNavigationPermissions } from 'src/core/decorators/user-navigation-permissions.decorator';

@Controller('container-layout')
export class ContainerLayoutController {
  
  constructor(
    private readonly _containerLayoutService: ContainerLayoutService,
    private readonly _containerLayoutValidatorService: containerLayoutValidatorService
  ) {}

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateContainerLayoutDto: UpdateContainerLayoutDto,
    @UserNavigationPermissions() userNavigationPermissions: NavigationPermissions
  ) {
    await this._containerLayoutValidatorService.validPermission(id, userNavigationPermissions);
    return this._containerLayoutService.update(
      id,
      updateContainerLayoutDto,
    );
  }
}
