export type Role = 'CLIENT' | 'ADMIN';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
}
