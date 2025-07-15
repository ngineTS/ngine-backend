import { Injectable } from '@nestjs/common';
import { CreateTestTextDto } from './dto/create-test-text.dto';
import { UpdateTestTextDto } from './dto/update-test-text.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestText } from './entities/test-text.entity';

@Injectable()
export class TestTextService {

  constructor(@InjectRepository(TestText)
              private testTextRepository: Repository<TestText>) {}

  create(createTestTextDto: CreateTestTextDto) {
    return 'This action adds a new testText';
  }

  findAll() {
    return `This action returns all testText`;
  }

  findOne(id: number) {
    return `This action returns a #${id} testText`;
  }

  async findByNavigationId(navigationId: string){
    return await this.testTextRepository.findOne({
      where: { navigationId: navigationId }
    })
  }

  update(id: number, updateTestTextDto: UpdateTestTextDto) {
    return `This action updates a #${id} testText`;
  }

  remove(id: number) {
    return `This action removes a #${id} testText`;
  }
}
