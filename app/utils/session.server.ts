import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { db } from './db.server';
import bcrypt from 'bcryptjs';

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export async function login(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.password) return null;

  try {
    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword) return null;

    return { id: user.id, email: user.email, role: user.role };
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return null;
  }
}

export async function createUserSession(userId: string, role: string, redirectTo: string) {
  const session = await storage.getSession();
  session.set("userId", userId);
  session.set("userRole", role);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}