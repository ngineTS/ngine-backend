import { Controller, Get } from '@nestjs/common';
import { NavigationTypeService } from './navigation-type.service';

@Controller('navigation-type')
export class NavigationTypeController {
  
  constructor(private readonly _navigationTypeService: NavigationTypeService) {}

  @Get()
  findAll() {
    return this._navigationTypeService.findAll();
  }

}
