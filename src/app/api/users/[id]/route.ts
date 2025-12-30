import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUserById, deleteUserById } from '@/services/user.service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Récupérer un utilisateur par ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });

  } catch (error) {
    console.error('Erreur GET /api/users/[id]:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un utilisateur
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const user = await updateUserById(id, body);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Utilisateur mis à jour avec succès', 
      data: user 
    });

  } catch (error) {
    console.error('Erreur PUT /api/users/[id]:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await deleteUserById(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Utilisateur supprimé avec succès' 
    });

  } catch (error) {
    console.error('Erreur DELETE /api/users/[id]:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
