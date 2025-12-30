import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    // Tenter la connexion
    await dbConnect();
    
    // Vérifier l'état de la connexion
    const connectionState = mongoose.connection.readyState;
    const states: { [key: number]: string } = {
      0: 'Déconnecté',
      1: 'Connecté',
      2: 'En cours de connexion',
      3: 'En cours de déconnexion',
    };

    // Récupérer des infos sur la base
    const dbName = mongoose.connection.db?.databaseName || 'Non disponible';
    const host = mongoose.connection.host || 'Non disponible';

    return NextResponse.json({
      success: true,
      message: '✅ Connexion à MongoDB Atlas réussie !',
      details: {
        état: states[connectionState] || 'Inconnu',
        baseDeDonnées: dbName,
        hôte: host,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error);
    
    return NextResponse.json({
      success: false,
      message: '❌ Échec de la connexion à MongoDB Atlas',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 });
  }
}
