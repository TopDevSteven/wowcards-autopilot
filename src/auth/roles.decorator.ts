import { SetMetadata } from "@nestjs/common";

export enum Role {
  Admin = "Admin",
  Member = "Member",
}

export const ROLES_KEY = "user_roles";
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
