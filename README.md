# Charity Activations

This application tracks charity activations per event. Attendees will see a donations dashboard and be able to select a charity to be donated to by scanning a QR code and completing a form. Optional lead data can be requested. The dashboard will update in real time as donation choices are made.

## 🥞 Tech Stack

- Web Framework - 💿 [Remix](https://remix.run/)
- Database - 🪳 [CockroachDB](https://www.cockroachlabs.com/)
- Database ORM - △ [Prisma](https://www.prisma.io/)
- Styling - 🍃 [Tailwind CSS](https://tailwindcss.com/)
- UI Components - 🧱 [shadcn/ui](https://ui.shadcn.com/) and [Radix](https://www.radix-ui.com/)
- Hosting

## 🎨 Customization

Parts of this application are ready to customize for you use. You can update information in the application config file (`/app/app.config.ts`). Styles can be updated using the Tailwind CSS config file (`tailwind.config.ts`). You can even specify a logo by updating the Company Logo component (`/app/components/company-logo.tsx`).

## 💾 Database Setup

This application uses Prisma to manage the database.

1. Update the `DATABASE_URL` environment variable with your CockroachDB connection string.
2. Run `npx prisma migrate` to create the database schema.

You can view the [ER Diagram](./erd.md) generated from the Prisma Schema.

## 🧑‍💻 Development

To run your Remix app locally, make sure your project's local dependencies are installed:

```sh
npm install
```

Afterwards, start the Remix development server like so:

```sh
npm run dev
```

Open up [http://localhost:3000](http://localhost:3000) and you should be ready to go!

## 🚧 Deployment

## 📝 License

Copyright © 2023 [Cockroach Labs](https://cockroachlabs.com). <br />
This project is [MIT](./LICENSE) licensed.
