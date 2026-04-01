import { Controller, Get } from '@nestjs/common';
import { ContainerStyleService } from './container-style.service';

@Controller('container-style')
export class ContainerStyleController {
 
  constructor(private _containerStyleService: ContainerStyleService) { }
 
  @Get('default')
  getDefaultContainerStyle() {
    return this._containerStyleService.geDefaultContainerStyle();
  }
}
