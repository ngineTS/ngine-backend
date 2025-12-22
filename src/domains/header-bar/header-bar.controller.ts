import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { HeaderBarService } from './header-bar.service';
import { CreateHeaderBarDto } from './dto/create-header-bar.dto';
import { UpdateHeaderBarDto } from './dto/update-header-bar.dto';
import { UserId } from 'src/core/decorators/user.decorator';

@Controller('header-bar')
export class HeaderBarController {
  constructor(private readonly headerBarService: HeaderBarService) {}

  @Post()
  create(
    @Body() createHeaderBarDto: CreateHeaderBarDto,
    @UserId() userId: string
  ) {
    return this.headerBarService.create(createHeaderBarDto, userId);
  }

  @Get('main')
  findMainHeaderBar(@UserId() userId: string) {
    return this.headerBarService.findMainHeaderBar(userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHeaderBarDto: UpdateHeaderBarDto,
    @UserId() userId: string
  ) {
    return this.headerBarService.update(id, updateHeaderBarDto, userId);
  }

  /*@Delete(':id')
  remove(
    @Param('id') id: string,
    @UserId() userId: string
  ) {
    return this.headerBarService.softDelete(id, userId);
  }*/
}
