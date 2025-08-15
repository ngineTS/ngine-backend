import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CustomFormService } from './custom-form.service';
import { CreateCustomFormDto } from './dto/create-custom-form.dto';
import { UpdateCustomFormDto } from './dto/update-custom-form.dto';

@Controller('custom-form')
export class CustomFormController {
  constructor(private readonly customFormService: CustomFormService) {}

  @Post()
  create(@Body() createCustomFormDto: CreateCustomFormDto) {
    return this.customFormService.create(createCustomFormDto);
  }

  @Get()
  findAll() {
    return this.customFormService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customFormService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomFormDto: UpdateCustomFormDto) {
    return this.customFormService.update(+id, updateCustomFormDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customFormService.remove(+id);
  }
}
