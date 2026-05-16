import { PartialType } from '@nestjs/mapped-types';
import { CreateQuillEditorDto } from './create-quill-editor.dto';

export class UpdateQuillEditorDto extends PartialType(CreateQuillEditorDto) {}
