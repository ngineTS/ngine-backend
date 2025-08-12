import { Test, TestingModule } from '@nestjs/testing';
import { QuillEditorController } from './quill-editor.controller';
import { QuillEditorService } from './quill-editor.service';

describe('QuillEditorController', () => {
  let controller: QuillEditorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuillEditorController],
      providers: [QuillEditorService],
    }).compile();

    controller = module.get<QuillEditorController>(QuillEditorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
