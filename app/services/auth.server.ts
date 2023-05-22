import type { UserWithoutPassword } from "~/models/user.server";
import { Authenticator /*, AuthorizationError*/ } from "remix-auth";
// import { FormStrategy } from "remix-auth-form";
import { OktaStrategy } from "remix-auth-okta";
import invariant from "tiny-invariant";
import { sessionStorage } from "~/services/session.server";
import { prisma } from "~/services/db.server";
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
export const authenticator = new Authenticator<UserWithoutPassword>(
  sessionStorage
);

const oktaStrategy = new OktaStrategy(
  {
    issuer: `${oktaDomain}/oauth2/default`,
    clientID: oktaClientId,
    clientSecret: oktaClientSecret,
    callbackURL: oktaCallbackUrl
  },
  async ({ accessToken, refreshToken, extraParams, profile }) => {
    return prisma.user.upsert({
      where: { email: profile.email },
      update: {},
      create: {
        email: profile.email,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        fullName: profile.displayName
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        firstName: true,
        lastName: true
      }
    });
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
//     return user;
//   }),
//   FormStrategy.name
// );

export const requireUser = async (
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) => {
  const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: `/admin?${searchParams}`
  });
  return user;
};
