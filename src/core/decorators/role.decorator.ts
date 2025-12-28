import { Reflector } from '@nestjs/core';

export const Permission = Reflector.createDecorator<'view' | 'add' | 'edit' | 'delete'>();

/* /!\ Feature name has to match postgres table name. */
export const Feature = Reflector.createDecorator<'calendar'>();


