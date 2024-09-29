import { useState } from 'react';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { json, ActionFunction } from '@remix-run/node';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { sendEmail } from '~/utils/email.server';

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const title = formData.get('title');
  const description = formData.get('description');
  const email = formData.get('email');

  const errors: { [key: string]: string } = {};
  if (!title) errors.title = 'Le titre est requis';
  if (!description) errors.description = 'La description est requise';
  if (!email) errors.email = "L'adresse e-mail est requise";
  else if (!/^\S+@\S+\.\S+$/.test(email.toString())) errors.email = "L'adresse e-mail est invalide";

  if (Object.keys(errors).length > 0) {
    return json({ errors });
  }

  try {
    await sendEmail(
      'zoo@example.com',
      `Contact Form: ${title}`,
      `From: ${email}\n\n${description}`
    );

    return json({ success: true });
  } catch (error) {
    return json({ error: 'Failed to send email' }, { status: 500 });
  }
};

export default function Contact() {
  const actionData = useActionData<{ errors?: { [key: string]: string }; success?: boolean }>();
  const navigation = useNavigation();
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!actionData?.errors) {
      setFormSubmitted(true);
    }
  };

  return (
    <div className="bg-green-50 min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-green-800 mb-6">Contactez-nous</h1>
        {formSubmitted ? (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
            <p className="font-bold">Merci pour votre message !</p>
            <p>Nous vous répondrons dans les plus brefs délais.</p>
          </div>
        ) : (
          <Form method="post" onSubmit={handleSubmit} className="max-w-lg mx-auto">
            <div className="mb-4">
              <label htmlFor="title" className="block text-gray-700 font-bold mb-2">Titre</label>
              <input
                type="text"
                id="title"
                name="title"
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-green-500"
                required
              />
              {actionData?.errors?.title && (
                <p className="text-red-500 text-xs italic">{actionData.errors.title}</p>
              )}
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 font-bold mb-2">Description</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-green-500"
                required
              ></textarea>
              {actionData?.errors?.description && (
                <p className="text-red-500 text-xs italic">{actionData.errors.description}</p>
              )}
            </div>
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
            <button
              type="submit"
              className="bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-green-700"
              disabled={navigation.state === 'submitting'}
            >
              {navigation.state === 'submitting' ? 'Envoi en cours...' : 'Envoyer'}
            </button>
          </Form>
        )}
      </main>
      <Footer />
    </div>
  );
}