import type { UserWithoutPassword } from "~/models/user.server";
import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import invariant from "tiny-invariant";
import { sessionStorage } from "~/services/session.server";
import { verifyLogin } from "~/models/user.server";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<UserWithoutPassword>(
  sessionStorage
);

// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email");
    const password = form.get("password");

    invariant(typeof email === "string", "email must be a string");
    invariant(typeof password === "string", "password must be a string");

    const user = await verifyLogin(email, password);
    if (!user) {
      throw new AuthorizationError(
        "Username/Password combination is incorrect"
      );
    }
    return user;
  }),
  "user-pass"
);
