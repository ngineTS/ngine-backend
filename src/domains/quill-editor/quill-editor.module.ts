import { Module } from '@nestjs/common';
import { QuillEditorService } from './quill-editor.service';
import { QuillEditorController } from './quill-editor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuillEditor } from './entities/quill-editor.entity';

@Module({
  imports:[TypeOrmModule.forFeature([QuillEditor])],
  controllers: [QuillEditorController],
  providers: [QuillEditorService],
})
export class QuillEditorModule {}
