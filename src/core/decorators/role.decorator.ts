import { Reflector } from '@nestjs/core';

export const Permission = Reflector.createDecorator<'view' | 'add' | 'edit' | 'delete'>();

/* /!\ Feature name has to match entity name. */
export const Feature = Reflector.createDecorator<'Calendar' | 'QuillEditor' | 'TableViz'>();


