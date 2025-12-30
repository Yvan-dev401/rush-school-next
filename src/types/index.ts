export interface Experience {
  _id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  _id?: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  birthDate?: string;
  profession?: string;
  summary?: string;
  skills: string[];
  experiences: Experience[];
  education: Education[];
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
