export type UserStatus = "available" | "away" | "busy";

export interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  avatar?: string;
}
