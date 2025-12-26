import { Reflector } from '@nestjs/core';

export const Permission = Reflector.createDecorator<'view' | 'add' | 'edit' | 'delete'>();


