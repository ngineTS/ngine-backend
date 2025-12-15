import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NavigationTypeService } from './navigation-type.service';
import { CreateNavigationTypeDto } from './dto/create-navigation-type.dto';
import { UpdateNavigationTypeDto } from './dto/update-navigation-type.dto';

@Controller('navigation-type')
export class NavigationTypeController {
  constructor(private readonly navigationTypeService: NavigationTypeService) {}

  @Get()
  findAll() {
    return this.navigationTypeService.findAll();
  }

}
