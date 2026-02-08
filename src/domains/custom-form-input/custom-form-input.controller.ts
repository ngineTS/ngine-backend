import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { CustomFormInputService } from './custom-form-input.service';
import { CreateCustomFormInputDto } from './dto/create-custom-form-input.dto';
import { UpdateCustomFormInputDto } from './dto/update-custom-form-input.dto';

@Controller('custom-form-input')
export class CustomFormInputController {

  constructor(private readonly customFormService: CustomFormInputService) {}

  @Post(':tableName')
  create(
    @Param('tableName') tableName: string,
    @Body() createCustomFormDto: CreateCustomFormInputDto[]
  ) {
    return this.customFormService.create(createCustomFormDto, tableName);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateCustomFormDto: UpdateCustomFormInputDto
  ) {
    return this.customFormService.update(id, updateCustomFormDto);
  }

}
