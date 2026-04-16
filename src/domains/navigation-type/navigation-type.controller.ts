import { Body, Controller, Get, Post } from '@nestjs/common';
import { NavigationTypeService } from './navigation-type.service';
import { CreateNavigationTypeDto } from './dto/create-navigation-type.dto';

@Controller('navigation-type')
export class NavigationTypeController {
  
  constructor(private readonly _navigationTypeService: NavigationTypeService) {}

  @Get()
  findAll() {
    return this._navigationTypeService.findAll();
  }

  @Post()
  create(@Body() createNavigationTypeDto: CreateNavigationTypeDto) {
    return this._navigationTypeService.create(createNavigationTypeDto);
  }

}
