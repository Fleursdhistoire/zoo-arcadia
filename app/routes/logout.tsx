import { ActionFunction, redirect } from '@remix-run/node';
import { logout } from '~/utils/session.server';

export const action: ActionFunction = async ({ request }) => {
  return logout(request);
};

export const loader = async () => {
  return redirect("/");
};