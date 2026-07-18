export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type ProfileInput = {
  full_name: string;
  username: string;
  email: string;
  major?: string;
  level?: string;
  current_semester?: string;
};

export type SecurityInput = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

export type SettingsTab = 'profile' | 'security';

export type DeleteAccountInput = {
  confirmation: string;
};
