import { Controller, Get } from '@nestjs/common';
import { TypographyStyleService } from './typography-style.service';

@Controller('typography-style')
export class TypographyStyleController {
  
  constructor(private _typographyStyleService: TypographyStyleService) { }
   
  @Get('default')
  getTypographyStyle() {
    return this._typographyStyleService.geDefaultTypographyStyle();
  }

}
