import { Module } from '@nestjs/common';
import { CustomFormService } from './custom-form-input.service';
import { CustomFormController } from './custom-form-input.controller';

@Module({
  controllers: [CustomFormController],
  providers: [CustomFormService],
})
export class CustomFormModule {}
