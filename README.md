# Charity Activations

This application tracks charity activations per event. Attendees will see a donations dashboard and be able to select a charity to be donated to by scanning a QR code and completing a form. Optional lead data can be requested. The dashboard will update in real time as donation choices are made.

## 🥞 Tech Stack

- Web Framework - 💿 [Remix](https://remix.run/)
- Database - 🪳 [CockroachDB](https://www.cockroachlabs.com/)
- Database ORM - △ [Prisma](https://www.prisma.io/)
- Styling - 🍃 [Tailwind CSS](https://tailwindcss.com/)
- UI Components - 🧱 [shadcn/ui](https://ui.shadcn.com/) and [Radix](https://www.radix-ui.com/)
- Hosting - 🎈 [Fly.io](https://fly.io/)

## 🎨 Customization

Parts of this application are ready to customize for you use. You can update information in the application config file (`/app/app.config.ts`). Styles can be updated using the Tailwind CSS config file (`tailwind.config.ts`). You can even specify a logo by updating the Company Logo component (`/app/components/company-logo.tsx`).

## 💾 Database Setup

This application uses Prisma to manage our database.

### 🧳 Migrate Schema Changes

1. Update the `DATABASE_URL` environment variable with your CockroachDB connection string.
2. Run `npx prisma migrate` to create the database schema.

You can view the [ER Diagram](./erd.md) generated from the Prisma Schema.

### 🚰 Create the Changefeed

<sup>This only needs to be done once.</sup>

In a terminal, run

```shell
npx prisma db execute --file ./prisma/sql/set_cluster_settings.sql
npx prisma db execute --file ./prisma/sql/create_changefeed_prod.sql
```

> **Note**
> You may also execute the contents of [set_cluster_settings.sql](./prisma/sql/set_cluster_settings.sql) and [create_changefeed_prod.sql](./prisma/sql/create_changefeed_prod.sql) in a sql shell.

## 🔐 Environment Variables

The following are other environment variables you need to set for the application to opperate. You can find them all in the `.env.sample` file.

**Remix Auth**

- `SESSION_SECRET` - any string will work or you can generate one with `openssl rand -hex 32`.

If you are using the Okta Strategy, you'll need the following from your [Okta web app](https://developer.okta.com/docs/guides/sign-into-web-app/nodeexpress/main/#understand-the-callback-route):

- `OKTA_DOMAIN` - Your Okta domain
- `OKTA_CLIENT_ID` - Your Okta client id
- `OKTA_CLIENT_SECRET` - Your Okta client secret
- `OKTA_CALLBACK_URL` - Your Okta callback url

## 🧑‍💻 Development

You should be able to develop without the need to be connected.

### 🪳 Set up a local CockroachDB Node

To create a local environment that most closely resembles our production CockroachDB serverless cluster, we'll start a local CockroachDB node running in [demo mode](https://www.cockroachlabs.com/docs/stable/cockroach-demo.html). This will allow us to start a temporary, in-memory CockroachDB single-node cluster with a temporary Enterprise license.

1. [Install CockroachDB](https://www.cockroachlabs.com/docs/v23.1/install-cockroachdb) on our local machine.
1. Make sure your [Prisma Seed file](./prisma/seed.ts) is set up to create any initial data needed.
1. In a terminal window, run `./dbserver_start.sh` to start a local CockroachDB node running in demo mode.
1. Update the `DATABASE_URL` in the your .env file to point to your local database.

   ```shell
    DATABASE_URL="postgresql://root@localhost:26257/charity_activations"
   ```

1. In a new terminal window or tab, run `./dbserver_init.sh`. This script will handle a few tasks:
   - Create the charity_events database in your local node.
   - Create the schema using Prisma
   - Seed the database using the [Prisma Seed file](./prisma/seed.ts)
   - Create the Changefeed that handles new donations on the Event Dashboard

> **Note**
> If you shut down your local CockroachDB server, you will lose any data added and will need to run the `./dbserver_start.sh` and `./dbserver_init.sh` scripts again.

### 💿 Run the Remix app locally with HTTPS

In order to use Changefeeds during local development, we need to configure our Remix developer envronment to use HTTPS.

1. Follow the [How to set up local HTTPS](https://remix.run/docs/en/main/other-api/dev-v2#how-to-set-up-local-https) instructions from [Remix](https://remix.run/) to create a certificate for localhst. Be sure to save the key.pem and cert.pem in the root of this project.
1. Make sure the project's local dependencies are installed:
   ```sh
   npm install
   ```
1. Start the Remix development server like so:
   ```sh
   npm run dev
   ```
1. Open up [https://localhost:3000](https://localhost:3000) and you should be ready to go!

🎉 You're ready to start developing. Look ma! No interwebs!

## 🚧 Deployment

This app is set up to deploy to [Fly.io](https://fly.io/) and comes with a GitHub Action that handles automatically deploying the app to production.

Prior to your first deployment, you'll need to do a few things:

- [Install Fly](https://fly.io/docs/getting-started/installing-flyctl/)

- Sign up and log in to Fly

  ```sh
  fly auth signup
  ```

  > **Note**: If you have more than one Fly account, ensure that you are signed
  > into the same account in the Fly CLI as you are in the browser. In your
  > terminal, run `fly auth whoami` and ensure the email matches the Fly account
  > signed into the browser.

- Create a new app on Fly:

  ```sh
  fly apps create [YOUR_APP_NAME]
  ```

  > **Note**: Make sure this name matches the `app` set in your `fly.toml` file.
  > Otherwise, you will not be able to deploy.

- Add a `FLY_API_TOKEN` to your GitHub repo. To do this, go to your user
  settings on Fly and create a new
  [token](https://web.fly.io/user/personal_access_tokens/new), then add it to
  [your repo secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
  with the name `FLY_API_TOKEN`.

- Add your environment vacriables to your fly app secrets, to do this you can run the following commands:

  ```sh
  fly secrets set DATABASE_URL="postgresql://" SESSION_SECRET=$(openssl rand -hex 32) [additional secrets] --app [YOUR_APP_NAME]
  ```

  If you don't have openssl installed, you can also use
  [1Password](https://1password.com/password-generator) to generate a random
  secret, just replace `$(openssl rand -hex 32)` with the generated secret.

Now that everything is set up you can commit and push your changes to your repo.
Every commit to your `main` branch will trigger a deployment to your production
environment.

## 📝 License

Copyright © 2023 [Cockroach Labs](https://cockroachlabs.com). <br />
This project is [MIT](./LICENSE) licensed.
