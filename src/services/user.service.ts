import dbConnect from '@/lib/mongodb';
import User, { IUser, IExperience, IEducation } from '@/models/User';
import mongoose from 'mongoose';

// Types pour les opérations CRUD
export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  birthDate?: string;
  profession?: string;
  summary?: string;
  skills?: string[];
  experiences?: IExperience[];
  education?: IEducation[];
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  birthDate?: string;
  profession?: string;
  summary?: string;
  skills?: string[];
  experiences?: IExperience[];
  education?: IEducation[];
}

// ==================== AFFICHER (READ) ====================

/**
 * Récupérer tous les utilisateurs
 */
export async function getAllUsers(): Promise<IUser[]> {
  await dbConnect();
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  return users;
}

/**
 * Récupérer un utilisateur par son ID
 */
export async function getUserById(id: string): Promise<IUser | null> {
  await dbConnect();
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('ID utilisateur invalide');
  }
  
  const user = await User.findById(id).select('-password');
  return user;
}

/**
 * Récupérer un utilisateur par son email
 */
export async function getUserByEmail(email: string): Promise<IUser | null> {
  await dbConnect();
  const user = await User.findOne({ email: email.toLowerCase() }).select('-password');
  return user;
}

/**
 * Récupérer un utilisateur avec son mot de passe (pour authentification)
 */
export async function getUserWithPassword(email: string): Promise<IUser | null> {
  await dbConnect();
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  return user;
}

// ==================== INSÉRER (CREATE) ====================

/**
 * Créer un nouvel utilisateur
 */
export async function createUser(userData: CreateUserData): Promise<IUser> {
  await dbConnect();
  
  // Vérifier si l'email existe déjà
  const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
  if (existingUser) {
    throw new Error('Un utilisateur avec cet email existe déjà');
  }
  
  const user = new User({
    ...userData,
    email: userData.email.toLowerCase(),
    skills: userData.skills || [],
    experiences: userData.experiences || [],
    education: userData.education || [],
  });
  
  await user.save();
  
  // Retourner l'utilisateur sans le mot de passe
  const userWithoutPassword = await User.findById(user._id).select('-password');
  return userWithoutPassword!;
}

// ==================== MODIFIER (UPDATE) ====================

/**
 * Mettre à jour un utilisateur par son ID
 */
export async function updateUserById(id: string, updateData: UpdateUserData): Promise<IUser | null> {
  await dbConnect();
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('ID utilisateur invalide');
  }
  
  // Empêcher la modification du mot de passe via cette fonction
  const { ...safeUpdateData } = updateData;
  
  const user = await User.findByIdAndUpdate(
    id,
    { $set: safeUpdateData },
    { new: true, runValidators: true }
  ).select('-password');
  
  return user;
}

/**
 * Mettre à jour un utilisateur par son email
 */
export async function updateUserByEmail(email: string, updateData: UpdateUserData): Promise<IUser | null> {
  await dbConnect();
  
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-password');
  
  return user;
}

/**
 * Mettre à jour le mot de passe d'un utilisateur
 */
export async function updateUserPassword(id: string, newPassword: string): Promise<boolean> {
  await dbConnect();
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('ID utilisateur invalide');
  }
  
  const user = await User.findById(id).select('+password');
  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }
  
  user.password = newPassword;
  await user.save(); // Le hook pre-save hashera automatiquement le mot de passe
  
  return true;
}

// ==================== SUPPRIMER (DELETE) ====================

/**
 * Supprimer un utilisateur par son ID
 */
export async function deleteUserById(id: string): Promise<boolean> {
  await dbConnect();
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('ID utilisateur invalide');
  }
  
  const result = await User.findByIdAndDelete(id);
  return result !== null;
}

/**
 * Supprimer un utilisateur par son email
 */
export async function deleteUserByEmail(email: string): Promise<boolean> {
  await dbConnect();
  
  const result = await User.findOneAndDelete({ email: email.toLowerCase() });
  return result !== null;
}

// ==================== OPÉRATIONS SPÉCIFIQUES ====================

/**
 * Ajouter une expérience à un utilisateur
 */
export async function addExperience(userId: string, experience: IExperience): Promise<IUser | null> {
  await dbConnect();
  
  const user = await User.findByIdAndUpdate(
    userId,
    { $push: { experiences: experience } },
    { new: true, runValidators: true }
  ).select('-password');
  
  return user;
}

/**
 * Supprimer une expérience d'un utilisateur
 */
export async function removeExperience(userId: string, experienceId: string): Promise<IUser | null> {
  await dbConnect();
  
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { experiences: { _id: experienceId } } },
    { new: true }
  ).select('-password');
  
  return user;
}

/**
 * Ajouter une formation à un utilisateur
 */
export async function addEducation(userId: string, education: IEducation): Promise<IUser | null> {
  await dbConnect();
  
  const user = await User.findByIdAndUpdate(
    userId,
    { $push: { education: education } },
    { new: true, runValidators: true }
  ).select('-password');
  
  return user;
}

/**
 * Supprimer une formation d'un utilisateur
 */
export async function removeEducation(userId: string, educationId: string): Promise<IUser | null> {
  await dbConnect();
  
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { education: { _id: educationId } } },
    { new: true }
  ).select('-password');
  
  return user;
}

/**
 * Mettre à jour les compétences d'un utilisateur
 */
export async function updateSkills(userId: string, skills: string[]): Promise<IUser | null> {
  await dbConnect();
  
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { skills } },
    { new: true }
  ).select('-password');
  
  return user;
}

/**
 * Compter le nombre total d'utilisateurs
 */
export async function countUsers(): Promise<number> {
  await dbConnect();
  return await User.countDocuments();
}

/**
 * Rechercher des utilisateurs par critères
 */
export async function searchUsers(query: string): Promise<IUser[]> {
  await dbConnect();
  
  const users = await User.find({
    $or: [
      { firstName: { $regex: query, $options: 'i' } },
      { lastName: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { profession: { $regex: query, $options: 'i' } },
    ]
  }).select('-password');
  
  return users;
}
