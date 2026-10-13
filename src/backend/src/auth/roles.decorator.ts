import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Declara que um handler exige o usuário estar em ao menos um dos grupos listados. */
export const Roles = (...groups: string[]) => SetMetadata(ROLES_KEY, groups);
