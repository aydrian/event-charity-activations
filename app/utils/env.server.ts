import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().nonempty(),
  FLY_APP_NAME: z.string().optional(),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  OKTA_CALLBACK_URL: z.string().nonempty(),
  OKTA_CLIENT_ID: z.string().nonempty(),
  OKTA_CLIENT_SECRET: z.string().nonempty(),
  OKTA_DOMAIN: z.string().nonempty(),
  SESSION_SECRET: z.string().nonempty()
});

const env = envSchema.parse(process.env);
export default env;
