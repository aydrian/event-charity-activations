import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import type { ButtonHTMLAttributes } from "react";

import { useForm } from "@conform-to/react";
import { redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { clsx } from "clsx";

import { Icon } from "~/components/icon.tsx";
import { authenticator } from "~/utils/auth.server.ts";

export const loader: LoaderFunction = () => redirect("/admin");

export const action: ActionFunction = ({ request }) => {
  return authenticator.authenticate("okta", request);
};

export function OktaLoginForm() {
  const oktaLoginFetcher = useFetcher<typeof action>();

  const [form] = useForm({
    id: "okta-login-form",
    lastSubmission: oktaLoginFetcher.data?.submission
  });

  return (
    <oktaLoginFetcher.Form action="/auth/okta" method="POST" {...form.props}>
      <OktaLoginButton className="mt-4" state={oktaLoginFetcher.state} />
    </oktaLoginFetcher.Form>
  );
}

interface OktaLoginButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  state?: "idle" | "loading" | "submitting";
  title?: string;
}

export function OktaLoginButton({
  disabled,
  state = "idle",
  title = "Sign in with Okta",
  ...props
}: OktaLoginButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        props.className,
        "inline-flex items-center rounded bg-[#3c5ae0] px-4 py-2 font-semibold text-white duration-300 hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-75"
      )}
      disabled={disabled || state !== "idle"}
    >
      <Icon
        className={clsx(
          "mr-2 h-8 w-8 text-white",
          state !== "idle" && "animate-spin-slow inline-block"
        )}
        name="okta-aura"
      />
      <span>{title}</span>
    </button>
  );
}
