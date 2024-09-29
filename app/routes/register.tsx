import { Form, useActionData, useNavigation, Link } from '@remix-run/react';
import { json, ActionFunction } from '@remix-run/node';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { db } from '~/utils/db.server';
import { createUserSession } from '~/utils/session.server';


export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');

  if (typeof email !== 'string' || typeof password !== 'string' || typeof confirmPassword !== 'string') {
    return json({ errors: { form: "Invalid form data" } }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return json({ errors: { confirmPassword: "Passwords do not match" } }, { status: 400 });
  }

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return json({ errors: { email: "A user with this email already exists" } }, { status: 400 });
  }

  const user = await db.user.create({
    data: { email, password, role: 'VISITOR' },
  });

  return createUserSession(user.id.toString(), user.role, '/');
};

export default function Register() {
  const actionData = useActionData<{ errors?: { [key: string]: string } }>();
  const navigation = useNavigation();

  return (
    <div className="bg-green-50 min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-green-800 mb-6">Inscription</h1>
        <Form method="post" className="max-w-md mx-auto">
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
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-green-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 font-bold mb-2">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-green-500"
              required
            />
            {actionData?.errors?.confirmPassword && (
              <p className="text-red-500 text-xs italic">{actionData.errors.confirmPassword}</p>
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
            {navigation.state === 'submitting' ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
        </Form>
        <div className="text-center mt-4">
          <Link to="/login" className="text-green-600 hover:text-green-800">
            Déjà un compte ? Se connecter
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}