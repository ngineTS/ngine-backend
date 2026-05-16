import { Test, TestingModule } from '@nestjs/testing';
import { QuillEditorService } from './quill-editor.service';

describe('QuillEditorService', () => {
  let service: QuillEditorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuillEditorService],
    }).compile();

    service = module.get<QuillEditorService>(QuillEditorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
