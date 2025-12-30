import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, createUser, searchUsers, countUsers } from '@/services/user.service';

// GET - Récupérer tous les utilisateurs ou rechercher
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const countOnly = searchParams.get('count');

    // Si on veut juste le nombre d'utilisateurs
    if (countOnly === 'true') {
      const total = await countUsers();
      return NextResponse.json({ success: true, count: total });
    }

    // Si on fait une recherche
    if (query) {
      const users = await searchUsers(query);
      return NextResponse.json({ success: true, data: users, count: users.length });
    }

    // Sinon, retourner tous les utilisateurs
    const users = await getAllUsers();
    return NextResponse.json({ success: true, data: users, count: users.length });

  } catch (error) {
    console.error('Erreur GET /api/users:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouvel utilisateur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation des champs requis
    const { firstName, lastName, email, password } = body;
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Champs requis manquants: firstName, lastName, email, password' },
        { status: 400 }
      );
    }

    const user = await createUser(body);
    
    return NextResponse.json(
      { success: true, message: 'Utilisateur créé avec succès', data: user },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erreur POST /api/users:', error);
    
    // Gérer l'erreur d'email déjà existant
    if (error instanceof Error && error.message.includes('existe déjà')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
