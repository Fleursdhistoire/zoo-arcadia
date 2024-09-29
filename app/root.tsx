import { json, LoaderFunction } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import { getUserId } from "./utils/session.server";
import { db } from "./utils/db.server";
import type { LinksFunction } from "@remix-run/node";

import styles from "~/tailwind.css?url";
import globalStyles from "./gloabal.css?url";

import Header from "./components/Header";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: globalStyles },
];

interface User {
  id: number;
  email: string;
  role: string;
}

interface LoaderData {
  user: User | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);

  let user = null;
  if (userId) {
    user = await db.user.findUnique({
      where: { id: parseInt(userId) },
      select: { id: true, email: true, role: true },
    });
  }

  return json<LoaderData>({ user });
};

export default function App() {
  const data = useLoaderData<LoaderData>();

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Links />
      </head>
      <body>
        <Header user={data.user} />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
