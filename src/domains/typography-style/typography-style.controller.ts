import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TypographyStyleService } from './typography-style.service';
import { CreateTypographyStyleDto } from './dto/create-typography-style.dto';
import { UpdateTypographyStyleDto } from './dto/update-typography-style.dto';

@Controller('typography-style')
export class TypographyStyleController {
  constructor(private readonly typographyStyleService: TypographyStyleService) {}

  @Post()
  create(@Body() createTypographyStyleDto: CreateTypographyStyleDto) {
    return this.typographyStyleService.create(createTypographyStyleDto);
  }

  @Get()
  findAll() {
    return this.typographyStyleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.typographyStyleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTypographyStyleDto: UpdateTypographyStyleDto) {
    return this.typographyStyleService.update(+id, updateTypographyStyleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.typographyStyleService.remove(+id);
  }
}
