import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuillEditorDto } from './dto/create-quill-editor.dto';
import { UpdateQuillEditorDto } from './dto/update-quill-editor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuillEditor } from './entities/quill-editor.entity';
import { NavigationService } from 'src/domains/navigation/navigation.service';
import { NotFoundError } from 'rxjs';

@Injectable()
export class QuillEditorService {

  constructor(@InjectRepository(QuillEditor)
                private quillEditorRepository: Repository<QuillEditor>,
                private navigationService: NavigationService) {}


  create(createQuillEditorDto: CreateQuillEditorDto) {
    return this.quillEditorRepository.save(createQuillEditorDto);
  }

  findAll() {
    return `This action returns all quillEditor`;
  }

  findOne(id: number) {
    return `This action returns a #${id} quillEditor`;
  }

  async findByNavigationId(navigationId: string){
    return await this.quillEditorRepository.findOne({
      where: { navigationId: navigationId }
    })
  }

  async update(id: string, updateQuillEditorDto: UpdateQuillEditorDto) {
    const updatedResult = await this.quillEditorRepository.update(id, updateQuillEditorDto);
    if(updatedResult.affected === 1) {
      console.log(updatedResult);
      return this.navigationService.updateNavigation(updateQuillEditorDto["navigationId"], {
        updatedBy: '00000000-0000-0000-0000-000000000000',
        updatedDate: new Date()
      })
    }
    else {
      throw new NotFoundException()
    }
  }

  remove(id: number) {
    return `This action removes a #${id} quillEditor`;
  }
}
