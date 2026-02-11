import { Body, Controller, Param, ParseUUIDPipe, Patch, Request } from '@nestjs/common';
import { ContainerLayoutService } from './container-layout.service';
import { UpdateContainerLayoutDto } from './dto/update-container-layout.dto';

@Controller('container-layout')
export class ContainerLayoutController {
  
  constructor(private readonly containerLayoutService: ContainerLayoutService) {}

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateContainerLayoutDto: UpdateContainerLayoutDto,
    @Request() req
  ) {
    return this.containerLayoutService.update(
      id,
      updateContainerLayoutDto,
      req.user.userNavigationPermissions
    );
  }
}
