import { createAuthClient } from "better-auth/react";
import { multiSessionClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [multiSessionClient()],
});

export const { signIn, signUp, useSession, signOut, deleteUser, updateUser } =
  authClient;
