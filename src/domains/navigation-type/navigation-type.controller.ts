import { Controller, Get } from '@nestjs/common';
import { NavigationTypeService } from './navigation-type.service';

@Controller('navigation-type')
export class NavigationTypeController {
  constructor(private readonly navigationTypeService: NavigationTypeService) {}

  @Get()
  findAll() {
    return this.navigationTypeService.findAll();
  }

}
