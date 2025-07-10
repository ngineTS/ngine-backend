import { Injectable } from '@nestjs/common';
import { CreateTestTextDto } from './dto/create-test-text.dto';
import { UpdateTestTextDto } from './dto/update-test-text.dto';

@Injectable()
export class TestTextService {
  create(createTestTextDto: CreateTestTextDto) {
    return 'This action adds a new testText';
  }

  findAll() {
    return `This action returns all testText`;
  }

  findOne(id: number) {
    return `This action returns a #${id} testText`;
  }

  update(id: number, updateTestTextDto: UpdateTestTextDto) {
    return `This action updates a #${id} testText`;
  }

  remove(id: number) {
    return `This action removes a #${id} testText`;
  }
}
