import { PrismaClient } from "@prisma/client";
import { StringValueNode } from "graphql";
import { ISODateString } from "next-auth";

export interface GraphQlContext {
  session: Session | null;
  prisma: PrismaClient;
  //pubsub
}

/**
 * Users
 */

export interface Session {
  user: User;
  expires: ISODateString;
}

export interface User {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  image: string;
  name: string;
}

export interface CreateUsernameResponse {
  success?: boolean;
  error?: string;
}
