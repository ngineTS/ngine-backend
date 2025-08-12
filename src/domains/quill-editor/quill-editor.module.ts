import { Module } from '@nestjs/common';
import { QuillEditorService } from './quill-editor.service';
import { QuillEditorController } from './quill-editor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuillEditor } from './entities/quill-editor.entity';
import { NavigationService } from 'src/domains/navigation/navigation.service';
import { Navigation } from 'src/domains/navigation/entities/navigation.entity';

@Module({
  imports:[TypeOrmModule.forFeature([QuillEditor, Navigation])],
  controllers: [QuillEditorController],
  providers: [QuillEditorService, NavigationService],
})
export class QuillEditorModule {}
