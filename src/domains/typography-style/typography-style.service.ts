import { Injectable } from '@nestjs/common';
import { CreateTypographyStyleDto } from './dto/create-typography-style.dto';
import { UpdateTypographyStyleDto } from './dto/update-typography-style.dto';

@Injectable()
export class TypographyStyleService {
  create(createTypographyStyleDto: CreateTypographyStyleDto) {
    return 'This action adds a new typographyStyle';
  }

  findAll() {
    return `This action returns all typographyStyle`;
  }

  findOne(id: number) {
    return `This action returns a #${id} typographyStyle`;
  }

  update(id: number, updateTypographyStyleDto: UpdateTypographyStyleDto) {
    return `This action updates a #${id} typographyStyle`;
  }

  remove(id: number) {
    return `This action removes a #${id} typographyStyle`;
  }
}
