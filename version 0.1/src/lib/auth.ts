import { supabase } from './supabase';
import { User } from '../types';

export async function signUp(email: string, password: string, fullName: string, role: 'server' | 'kitchen' | 'admin') {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('User creation failed');

  const { error: staffError } = await supabase
    .from('staff')
    .insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      role,
      is_active: true,
    });

  if (staffError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw staffError;
  }

  return authData.user;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data: staffData, error } = await supabase
    .from('staff')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error) throw error;
  return staffData;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}
