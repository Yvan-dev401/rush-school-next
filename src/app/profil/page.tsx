'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, Experience, Education } from '@/types';
import generateCV from '@/utils/generateCV';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, logout, updateUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/authentification');
    }
    if (user) {
      setProfile({
        ...user,
        skills: user.skills || [],
        experiences: user.experiences || [],
        education: user.education || [],
      });
    }
  }, [user, isAuthenticated, authLoading, router]);

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        const data = await res.json();
        updateUser(data.user);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = () => {
    if (profile && newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    if (profile) {
      const newSkills = [...profile.skills];
      newSkills.splice(index, 1);
      setProfile({ ...profile, skills: newSkills });
    }
  };

  const addExperience = () => {
    if (profile) {
      const newExp: Experience = {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
      };
      setProfile({ ...profile, experiences: [newExp, ...profile.experiences] });
    }
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    if (profile) {
      const newExps = [...profile.experiences];
      newExps[index] = { ...newExps[index], [field]: value };
      setProfile({ ...profile, experiences: newExps });
    }
  };

  const removeExperience = (index: number) => {
    if (profile) {
      const newExps = [...profile.experiences];
      newExps.splice(index, 1);
      setProfile({ ...profile, experiences: newExps });
    }
  };

  const addEducation = () => {
    if (profile) {
      const newEdu: Education = {
        school: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
      };
      setProfile({ ...profile, education: [newEdu, ...profile.education] });
    }
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    if (profile) {
      const newEdus = [...profile.education];
      newEdus[index] = { ...newEdus[index], [field]: value };
      setProfile({ ...profile, education: newEdus });
    }
  };

  const removeEducation = (index: number) => {
    if (profile) {
      const newEdus = [...profile.education];
      newEdus.splice(index, 1);
      setProfile({ ...profile, education: newEdus });
    }
  };

  const exportToPDF = async () => {
    if (!profile) return;
    
    try {
      await generateCV({ user: profile });
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF');
    }
  };

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Header */}
      <header className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Mon Profil</h1>
        <div className="flex flex-wrap gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              ✏️ Modifier
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                💾 {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  if (user) setProfile({ ...user, skills: user.skills || [], experiences: user.experiences || [], education: user.education || [] });
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                ❌ Annuler
              </button>
            </>
          )}
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            📄 Exporter CV
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            🚪 Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        {/* Informations personnelles */}
        <section className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-3 mb-6">
            Informations personnelles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-800">{profile.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-800">{profile.lastName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-800">{profile.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-800">{profile.phone || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.city || ''}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-800">{profile.city || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.country || ''}
                  onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-800">{profile.country || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
              {isEditing ? (
                <input
                  type="date"
                  value={profile.birthDate || ''}
                  onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-800">{profile.birthDate || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.profession || ''}
                  onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-800">{profile.profession || '-'}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Résumé professionnel</label>
              {isEditing ? (
                <textarea
                  value={profile.summary || ''}
                  onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-800">{profile.summary || '-'}</p>
              )}
            </div>
          </div>
        </section>

        {/* Compétences */}
        <section className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-3 mb-6">
            Compétences
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium"
              >
                {skill}
                {isEditing && (
                  <button
                    onClick={() => removeSkill(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                placeholder="Nouvelle compétence"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addSkill}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ajouter
              </button>
            </div>
          )}
        </section>

        {/* Expériences */}
        <section className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center border-b-2 border-gray-200 pb-3 mb-6">
            <h2 className="text-xl font-semibold text-blue-900">Expériences professionnelles</h2>
            {isEditing && (
              <button
                onClick={addExperience}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                + Ajouter
              </button>
            )}
          </div>
          <div className="space-y-4">
            {profile.experiences.map((exp, index) => (
              <div key={index} className="relative bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => removeExperience(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      🗑️
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        placeholder="Entreprise"
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => updateExperience(index, 'position', e.target.value)}
                        placeholder="Poste"
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                        placeholder="Fin (ou Présent)"
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        placeholder="Description"
                        className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg"
                        rows={2}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-blue-800">{exp.position}</h3>
                    <p className="text-blue-600">{exp.company}</p>
                    <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</p>
                    <p className="text-gray-700 mt-2">{exp.description}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Formation */}
        <section className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center border-b-2 border-gray-200 pb-3 mb-6">
            <h2 className="text-xl font-semibold text-blue-900">Formation</h2>
            {isEditing && (
              <button
                onClick={addEducation}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                + Ajouter
              </button>
            )}
          </div>
          <div className="space-y-4">
            {profile.education.map((edu, index) => (
              <div key={index} className="relative bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => removeEducation(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      🗑️
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => updateEducation(index, 'school', e.target.value)}
                        placeholder="Établissement"
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        placeholder="Diplôme"
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={edu.field}
                        onChange={(e) => updateEducation(index, 'field', e.target.value)}
                        placeholder="Domaine"
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={edu.startDate}
                          onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                          placeholder="Début"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          value={edu.endDate}
                          onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                          placeholder="Fin"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-blue-800">{edu.degree} - {edu.field}</h3>
                    <p className="text-blue-600">{edu.school}</p>
                    <p className="text-sm text-gray-500">{edu.startDate} - {edu.endDate}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
