import { Module } from '@nestjs/common';
import { CustomFormService } from './custom-form.service';
import { CustomFormController } from './custom-form.controller';

@Module({
  controllers: [CustomFormController],
  providers: [CustomFormService],
})
export class CustomFormModule {}
