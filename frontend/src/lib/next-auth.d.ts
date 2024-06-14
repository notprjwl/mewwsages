import "next-auth";

// declaring types
declare module "next-auth" {
  interface Session {
    user: User;
  }

  interface User {
    id: string;
    username: string;
    image: string;
  }
}
