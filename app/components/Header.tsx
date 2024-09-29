import { Link, useSubmit } from '@remix-run/react';
import { useState } from 'react';

interface User {
  id: number;
  email: string;
  role: string;
}

interface HeaderProps {
  user: User | null;
}

export default function Header({ user }: HeaderProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const submit = useSubmit();

  const handleLogout = () => {
    submit(null, { method: "post", action: "/logout" });
  };

  const getDashboardLink = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return "/admin";
      case 'EMPLOYEE':
        return "/employee/dashboard";
      case 'VETERINARIAN':
        return "/veterinarian/dashboard";
      default:
        return "/";
    }
  };

  return (
    <header className="bg-green-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Zoo Arcadia</Link>
        <nav>
          <ul className="flex space-x-4 items-center">
            <li><Link to="/" className="hover:text-green-200">Accueil</Link></li>
            <li><Link to="/services" className="hover:text-green-200">Services</Link></li>
            <li><Link to="/habitats" className="hover:text-green-200">Habitats</Link></li>
            <li><Link to="/contact" className="hover:text-green-200">Contact</Link></li>
            {user ? (
              <>
                <li>
                  <Link to={getDashboardLink(user.role)} className="hover:text-green-200">
                    {user.role === 'ADMIN' && "Tableau de bord admin"}
                    {user.role === 'EMPLOYEE' && "Tableau de bord employé"}
                    {user.role === 'VETERINARIAN' && "Tableau de bord vétérinaire"}
                  </Link>
                </li>
                <li className="relative">
                  <button 
                    onClick={() => setIsLoginOpen(!isLoginOpen)}
                    className="hover:text-green-200"
                  >
                    {user.email}
                  </button>
                  {isLoginOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Se déconnecter
                      </button>
                    </div>
                  )}
                </li>
              </>
            ) : (
              <li>
                <Link to="/login" className="hover:text-green-200">Connexion</Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}