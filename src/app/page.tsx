'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-blue-900 mb-6">
            Bienvenue sur Rush School
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Gérez votre profil professionnel et exportez votre CV en un clic.
          </p>

          <div className="flex justify-center gap-4">
            {isAuthenticated ? (
              <Link
                href="/profil"
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Mon Profil
              </Link>
            ) : (
              <>
                <Link
                  href="/authentification"
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Se connecter
                </Link>
                <Link
                  href="/inscription"
                  className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Gérez votre profil
            </h3>
            <p className="text-gray-600">
              Ajoutez vos expériences, formations et compétences facilement.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Exportez en PDF
            </h3>
            <p className="text-gray-600">
              Générez un CV professionnel en un seul clic.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Sécurisé
            </h3>
            <p className="text-gray-600">
              Vos données sont stockées de manière sécurisée.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
