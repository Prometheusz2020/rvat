import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            role: string;
            id: string;
        } & DefaultSession["user"]
    }

    interface User {
        role: string;
        id?: string; // Typescript weirdness with AdapterUser
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string;
        id: string;
    }
}
