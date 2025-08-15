import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CustomFormInputService } from './custom-form-input.service';
import { CreateCustomFormInputDto } from './dto/create-custom-form-input.dto';
import { UpdateCustomFormInputDto } from './dto/update-custom-form-input.dto';

@Controller('custom-form')
export class CustomFormInputController {
  constructor(private readonly customFormService: CustomFormInputService) {}

  @Post()
  create(@Body() createCustomFormDto: CreateCustomFormInputDto) {
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
  update(@Param('id') id: string, @Body() updateCustomFormDto: UpdateCustomFormInputDto) {
    return this.customFormService.update(+id, updateCustomFormDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customFormService.remove(+id);
  }
}
