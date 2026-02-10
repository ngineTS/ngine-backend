import { Controller, Get, Post, Body, Patch, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { QuillEditorService } from './quill-editor.service';
import { CreateQuillEditorDto } from './dto/create-quill-editor.dto';
import { UpdateQuillEditorDto } from './dto/update-quill-editor.dto';
import { UserId } from 'src/core/decorators/user.decorator';
import { Feature, Permission } from 'src/core/decorators/role.decorator';
import { RolesGuard } from 'src/core/guards/role.guard';

@Feature('QuillEditor')
@Controller('quill-editor')
export class QuillEditorController {
  constructor(private readonly quillEditorService: QuillEditorService) {}

  @Post()
  @Permission('add')
  @UseGuards(RolesGuard)
  create(@Body() createQuillEditorDto: CreateQuillEditorDto) {
    return this.quillEditorService.create(createQuillEditorDto);
  }

  @Get('navigation/:navigationId')
  @Permission('view')
  @UseGuards(RolesGuard)
  findbyNavigationId(@Param('navigationId', new ParseUUIDPipe()) navigationId: string) {
    return this.quillEditorService.findByNavigationId(navigationId);
  }

  @Patch(':id')
  @Permission('edit')
  @UseGuards(RolesGuard)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateQuillEditorDto: UpdateQuillEditorDto,
    @UserId() userId: string
  ) {
    return this.quillEditorService.update(id, updateQuillEditorDto, userId);
  }
}
