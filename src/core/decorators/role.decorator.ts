import { Reflector } from '@nestjs/core';

export const Permission = Reflector.createDecorator<'view' | 'add' | 'edit' | 'delete'>();

/** /!\ Feature name shall match entity class name. */
export const Feature = Reflector.createDecorator<'Calendar' | 'QuillEditor' | 'TableViz' | 'Role'>();

/** /!\ NavigationTypeName shall match name in navigation_type table. */ 
export const NavigationTypeNameArray = Reflector.createDecorator<Array<NavigationTypeName>>();

type NavigationTypeName = 'role-management' 
    | 'user-management'
    | 'media-library'
    | 'analytic'
    | 'calendar'
    | 'my-quill-editor'
    | 'content-management'
    | 'content-visualization';


