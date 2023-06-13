import { Authenticator /*, AuthorizationError*/ } from "remix-auth";
// import { FormStrategy } from "remix-auth-form";
import { OktaStrategy } from "remix-auth-okta";
import invariant from "tiny-invariant";

import { prisma } from "~/utils/db.server";
import { sessionStorage } from "~/utils/session.server";
// import { type User } from "@prisma/client";
// import bcrypt from "bcryptjs";
// import { verifyLogin } from "~/models/user.server";

const oktaDomain = process.env.OKTA_DOMAIN;
invariant(typeof oktaDomain === "string", `OKTA_DOMAIN is required`);
const oktaClientId = process.env.OKTA_CLIENT_ID;
invariant(typeof oktaClientId === "string", `OKTA_CLIENT_ID is required`);
const oktaClientSecret = process.env.OKTA_CLIENT_SECRET;
invariant(
  typeof oktaClientSecret === "string",
  `OKTA_CLIENT_SECRET is required`
);
const oktaCallbackUrl = process.env.OKTA_CALLBACK_URL;
invariant(typeof oktaCallbackUrl === "string", `OKTA_CALLBACK_URL is required`);

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<string>(sessionStorage);

const oktaStrategy = new OktaStrategy(
  {
    callbackURL: oktaCallbackUrl,
    clientID: oktaClientId,
    clientSecret: oktaClientSecret,
    issuer: `${oktaDomain}/oauth2/default`
  },
  async ({ accessToken, extraParams, profile, refreshToken }) => {
    const user = await prisma.user.upsert({
      create: {
        email: profile.email,
        firstName: profile.name.givenName,
        fullName: profile.displayName,
        lastName: profile.name.familyName
      },
      select: {
        id: true
      },
      update: {},
      where: { email: profile.email }
    });
    return user.id;
  }
);

// Tell the Authenticator to use the OKTA strategy
authenticator.use(oktaStrategy);

// TODO: Handle multiple strategies
// Tell the Authenticator to use the form strategy
// authenticator.use(
//   new FormStrategy(async ({ form }) => {
//     const email = form.get("email");
//     const password = form.get("password");

//     invariant(typeof email === "string", "email must be a string");
//     invariant(typeof password === "string", "password must be a string");

//     const user = await verifyLogin(email, password);
//     if (!user) {
//       throw new AuthorizationError(
//         "Username/Password combination is incorrect"
//       );
//     }
//     return user.id;
//   }),
//   FormStrategy.name
// );

export const requireUserId = async (
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) => {
  const searchParams = new URLSearchParams([
    ["redirectTo", redirectTo],
    ["loginMessage", "Please login to continue"]
  ]);
  const userId = await authenticator.isAuthenticated(request, {
    failureRedirect: `/admin?${searchParams}`
  });
  return userId;
};

// export async function verifyLogin(email: User["email"], password: string) {
//   const userWithPassword = await prisma.user.findUnique({
//     select: { id: true, passwordHash: true },
//     where: { email }
//   });

//   if (!userWithPassword || !userWithPassword.passwordHash) {
//     return null;
//   }

//   const isValid = await bcrypt.compare(password, userWithPassword.passwordHash);

//   if (!isValid) {
//     return null;
//   }

//   return { id: userWithPassword.id };
// }
