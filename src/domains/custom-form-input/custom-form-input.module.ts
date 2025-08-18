import { Module } from '@nestjs/common';
import { CustomFormInputService } from './custom-form-input.service';
import { CustomFormInputController } from './custom-form-input.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomFormInput } from './entities/custom-form-input.entity';

@Module({
  imports:[TypeOrmModule.forFeature([CustomFormInput])],
  controllers: [CustomFormInputController],
  providers: [CustomFormInputService],
})
export class CustomFormInputModule {}
