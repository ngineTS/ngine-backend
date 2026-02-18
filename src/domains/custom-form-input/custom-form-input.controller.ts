import { Controller, Post, Body, Patch, Param, ParseUUIDPipe, Request, ParseArrayPipe } from '@nestjs/common';
import { CustomFormInputService } from './custom-form-input.service';
import { CreateCustomFormInputDto } from './dto/create-custom-form-input.dto';
import { UpdateCustomFormInputDto } from './dto/update-custom-form-input.dto';

@Controller('custom-form-input')
export class CustomFormInputController {

  constructor(private readonly customFormService: CustomFormInputService) {}

  @Post(':tableName')
  create(
    @Param('tableName') tableName: string,
    @Body(new ParseArrayPipe({ items: CreateCustomFormInputDto }))
    createCustomFormInputDto: Array<CreateCustomFormInputDto>,
    @Request() req
  ) {
    return this.customFormService.create(
      createCustomFormInputDto,
      tableName,
      req.user.userNavigationPermissions
    );
  }

  @Patch(':tableName')
  update(
    @Param('tableName') tableName: string,
    @Body(new ParseArrayPipe({ items: CreateCustomFormInputDto }))
    createCustomFormInputDto: Array<CreateCustomFormInputDto>,
    @Request() req
  ) {
    return this.customFormService.update(
      tableName,
      createCustomFormInputDto,
      req.user.userNavigationPermissions
    );
  }
}
