import { Controller, Post, Body, Patch, Param, ParseUUIDPipe, Request } from '@nestjs/common';
import { CustomFormInputService } from './custom-form-input.service';
import { CreateCustomFormInputDto } from './dto/create-custom-form-input.dto';
import { UpdateCustomFormInputDto } from './dto/update-custom-form-input.dto';

@Controller('custom-form-input')
export class CustomFormInputController {

  constructor(private readonly customFormService: CustomFormInputService) {}

  @Post(':tableName')
  create(
    @Param('tableName') tableName: string,
    @Body() createCustomFormDto: Array<CreateCustomFormInputDto>,
    @Request() req
  ) {
    return this.customFormService.create(
      createCustomFormDto,
      tableName,
      req.user.userNavigationPermissions
    );
  }

  @Patch(':tableName')
  update(
    @Param('tableName') tableName: string,
    @Body() createCustomFormDto: Array<CreateCustomFormInputDto>,
    @Request() req
  ) {
    return this.customFormService.update(
      tableName,
      createCustomFormDto,
      req.user.userNavigationPermissions
    );
  }
}
