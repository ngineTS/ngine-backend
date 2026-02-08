import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuillEditorDto } from './dto/create-quill-editor.dto';
import { UpdateQuillEditorDto } from './dto/update-quill-editor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuillEditor } from './entities/quill-editor.entity';

@Injectable()
export class QuillEditorService {

  constructor(@InjectRepository(QuillEditor)
              private quillEditorRepository: Repository<QuillEditor>
             ) {}


  create(createQuillEditorDto: CreateQuillEditorDto) {
    return this.quillEditorRepository.save(createQuillEditorDto);
  }

  async findByNavigationId(navigationId: string){
    return await this.quillEditorRepository.findOne({
      where: { navigationId: navigationId }
    })
  }

  async update(
    id: string,
    updateQuillEditorDto: UpdateQuillEditorDto,
    userId: string
  ) {
    const updatedResult = await this.quillEditorRepository.update(id, updateQuillEditorDto);
    if(updatedResult.affected === 0) {
      throw new NotFoundException();
    }

    /*return this.navigationService.updateNavigation(
      updateQuillEditorDto["navigationId"],
      { updatedBy: userId, updatedDate: new Date() },
      userId
    )*/
    return updatedResult;
  }
}
