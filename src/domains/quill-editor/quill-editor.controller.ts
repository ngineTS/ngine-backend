import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { QuillEditorService } from './quill-editor.service';
import { CreateQuillEditorDto } from './dto/create-quill-editor.dto';
import { UpdateQuillEditorDto } from './dto/update-quill-editor.dto';

@Controller('quill-editor')
export class QuillEditorController {
  constructor(private readonly quillEditorService: QuillEditorService) {}

  @Post()
  create(@Body() createQuillEditorDto: CreateQuillEditorDto) {
    return this.quillEditorService.create(createQuillEditorDto);
  }

  @Get('navigation/:navigationId')
  findbyNavigationId(@Param('navigationId') navigationId: string) {
    return this.quillEditorService.findByNavigationId(navigationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuillEditorDto: UpdateQuillEditorDto) {
    return this.quillEditorService.update(id, updateQuillEditorDto);
  }
}
