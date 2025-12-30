'use client';

import jsPDF from 'jspdf';
import { User } from '@/types';

interface CVData {
  user: User;
}

export async function generateCV({ user }: CVData): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Couleurs
  const primaryColor: [number, number, number] = [30, 64, 175]; // Bleu foncé
  const secondaryColor: [number, number, number] = [59, 130, 246]; // Bleu
  const textColor: [number, number, number] = [55, 65, 81]; // Gris foncé
  const lightGray: [number, number, number] = [156, 163, 175]; // Gris clair

  // Fonction pour vérifier si on a besoin d'une nouvelle page
  const checkNewPage = (neededSpace: number) => {
    if (yPosition + neededSpace > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Fonction pour dessiner une ligne de séparation
  const drawSectionLine = () => {
    pdf.setDrawColor(...secondaryColor);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
  };

  // ===================== HEADER =====================
  // Bande colorée en haut
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, pageWidth, 45, 'F');

  // Nom et prénom
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  const fullName = `${user.firstName} ${user.lastName}`.toUpperCase();
  pdf.text(fullName, pageWidth / 2, 20, { align: 'center' });

  // Profession
  if (user.profession) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text(user.profession, pageWidth / 2, 30, { align: 'center' });
  }

  // Informations de contact
  pdf.setFontSize(10);
  const contactInfo: string[] = [];
  if (user.email) contactInfo.push(user.email);
  if (user.phone) contactInfo.push(user.phone);
  if (user.city && user.country) contactInfo.push(`${user.city}, ${user.country}`);
  else if (user.city) contactInfo.push(user.city);
  else if (user.country) contactInfo.push(user.country);

  if (contactInfo.length > 0) {
    pdf.text(contactInfo.join('  |  '), pageWidth / 2, 40, { align: 'center' });
  }

  yPosition = 55;

  // ===================== PROFIL / RÉSUMÉ =====================
  if (user.summary) {
    checkNewPage(30);
    
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PROFIL', margin, yPosition);
    yPosition += 6;
    drawSectionLine();

    pdf.setTextColor(...textColor);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const summaryLines = pdf.splitTextToSize(user.summary, contentWidth);
    pdf.text(summaryLines, margin, yPosition);
    yPosition += (summaryLines.length * 5) + 10;
  }

  // ===================== COMPÉTENCES =====================
  if (user.skills && user.skills.length > 0) {
    checkNewPage(30);

    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('COMPÉTENCES', margin, yPosition);
    yPosition += 6;
    drawSectionLine();

    pdf.setFontSize(10);
    
    let xPosition = margin;
    const skillPadding = 3;
    const skillHeight = 7;
    const skillGap = 4;
    const lineHeight = skillHeight + 3;

    for (const skill of user.skills) {
      const skillWidth = pdf.getTextWidth(skill) + (skillPadding * 2);
      
      // Vérifier si on dépasse la largeur de page
      if (xPosition + skillWidth > pageWidth - margin) {
        xPosition = margin;
        yPosition += lineHeight;
        checkNewPage(lineHeight);
      }

      // Dessiner le tag de compétence
      pdf.setFillColor(219, 234, 254); // Bleu clair
      pdf.roundedRect(xPosition, yPosition - 5, skillWidth, skillHeight, 2, 2, 'F');
      
      pdf.setTextColor(...primaryColor);
      pdf.setFont('helvetica', 'normal');
      pdf.text(skill, xPosition + skillPadding, yPosition);
      
      xPosition += skillWidth + skillGap;
    }
    
    yPosition += 20;
  }

  // ===================== EXPÉRIENCES PROFESSIONNELLES =====================
  if (user.experiences && user.experiences.length > 0) {
    checkNewPage(40);

    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('EXPÉRIENCES PROFESSIONNELLES', margin, yPosition);
    yPosition += 6;
    drawSectionLine();

    for (const exp of user.experiences) {
      checkNewPage(35);

      // Poste
      pdf.setTextColor(...textColor);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(exp.position || 'Poste non spécifié', margin, yPosition);
      
      // Dates à droite
      pdf.setTextColor(...lightGray);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const dateText = `${exp.startDate || ''} - ${exp.endDate || 'Présent'}`;
      pdf.text(dateText, pageWidth - margin, yPosition, { align: 'right' });
      
      yPosition += 5;

      // Entreprise
      pdf.setTextColor(...secondaryColor);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(exp.company || '', margin, yPosition);
      yPosition += 5;

      // Description
      if (exp.description) {
        pdf.setTextColor(...textColor);
        pdf.setFontSize(10);
        const descLines = pdf.splitTextToSize(exp.description, contentWidth);
        pdf.text(descLines, margin, yPosition);
        yPosition += (descLines.length * 5);
      }
      
      yPosition += 12;
    }
  }

  // ===================== FORMATION =====================
  if (user.education && user.education.length > 0) {
    checkNewPage(40);

    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FORMATION', margin, yPosition);
    yPosition += 6;
    drawSectionLine();

    for (const edu of user.education) {
      checkNewPage(25);

      // Diplôme et domaine
      pdf.setTextColor(...textColor);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      const degreeText = `${edu.degree || ''} - ${edu.field || ''}`;
      pdf.text(degreeText, margin, yPosition);
      
      // Dates à droite
      pdf.setTextColor(...lightGray);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const dateText = `${edu.startDate || ''} - ${edu.endDate || ''}`;
      pdf.text(dateText, pageWidth - margin, yPosition, { align: 'right' });
      
      yPosition += 5;

      // École
      pdf.setTextColor(...secondaryColor);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(edu.school || '', margin, yPosition);
      
      yPosition += 14;
    }
  }

  // ===================== INFORMATIONS COMPLÉMENTAIRES =====================
  const additionalInfo: string[] = [];
  if (user.birthDate) additionalInfo.push(`Date de naissance: ${user.birthDate}`);
  if (user.address) {
    let addressText = user.address;
    if (user.postalCode) addressText += `, ${user.postalCode}`;
    if (user.city) addressText += ` ${user.city}`;
    additionalInfo.push(`Adresse: ${addressText}`);
  }

  if (additionalInfo.length > 0) {
    checkNewPage(30);

    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INFORMATIONS COMPLÉMENTAIRES', margin, yPosition);
    yPosition += 6;
    drawSectionLine();

    pdf.setTextColor(...textColor);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    for (const info of additionalInfo) {
      pdf.text(info, margin, yPosition);
      yPosition += 6;
    }
  }

  // ===================== PIED DE PAGE =====================
  const footerY = pageHeight - 10;
  pdf.setTextColor(...lightGray);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  pdf.text(`CV généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, footerY, { align: 'center' });

  // Télécharger le PDF
  const fileName = `CV_${user.firstName}_${user.lastName}.pdf`.replace(/\s+/g, '_');
  pdf.save(fileName);
}

export default generateCV;
