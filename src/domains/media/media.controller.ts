import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  create(@Body() createMediaDto: CreateMediaDto) {
    return this.mediaService.create(createMediaDto);
  }

  @Get()
  findAll(
    @Query('orderBy') orderBy: string = 'createdDate',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
  ) {
    return this.mediaService.findAll(orderBy, order);
  }

  @Delete(':fileName')
  remove(@Param('fileName') fileName: string) {
    return this.mediaService.softDelete(fileName);
  }
}
