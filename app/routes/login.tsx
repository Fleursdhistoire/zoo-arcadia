import { Form, useActionData, useNavigation, useSearchParams } from '@remix-run/react';
import { json, ActionFunction, redirect, LoaderFunction } from '@remix-run/node';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { createUserSession, getUserId, login } from '~/utils/session.server';
import { Link } from '@remix-run/react';

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const redirectTo = formData.get('redirectTo') || '/';

  if (typeof email !== 'string' || typeof password !== 'string' || typeof redirectTo !== 'string') {
    return json({ errors: { email: "Invalid email", password: "Invalid password" } }, { status: 400 });
  }

  const user = await login(email, password);
  if (!user) {
    return json({ errors: { form: "Invalid email or password" } }, { status: 400 });
  }

  return createUserSession(user.id.toString(), user.role, redirectTo);
};

export default function Login() {
  const actionData = useActionData<{ errors?: { [key: string]: string } }>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();

  return (
    <div className="bg-green-50 min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-green-800 mb-6">Connexion</h1>
        <Form method="post" className="max-w-md mx-auto">
          <input
            type="hidden"
            name="redirectTo"
            value={searchParams.get('redirectTo') ?? undefined}
          />
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Adresse e-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-green-500"
              required
            />
            {actionData?.errors?.email && (
              <p className="text-red-500 text-xs italic">{actionData.errors.email}</p>
            )}
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-green-500"
              required
            />
            {actionData?.errors?.password && (
              <p className="text-red-500 text-xs italic">{actionData.errors.password}</p>
            )}
          </div>
          {actionData?.errors?.form && (
            <p className="text-red-500 text-sm italic mb-4">{actionData.errors.form}</p>
          )}
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-green-700 mb-4"
            disabled={navigation.state === 'submitting'}
          >
            {navigation.state === 'submitting' ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </Form>
        <div className="text-center mt-4">
          <Link to="/register" className="text-green-600 hover:text-green-800">
            Pas encore de compte ? S&apos;inscrire
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}