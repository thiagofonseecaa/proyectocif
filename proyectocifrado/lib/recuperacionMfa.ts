import type { SupabaseClient } from '@supabase/supabase-js';

export async function revisarMfaRecuperacion(client: SupabaseClient, userId: string) {
  const user = await client.auth.getUser();
  if (user.error || user.data.user?.id !== userId) throw new Error('La sesión de recuperación venció. Solicitá otro enlace.');
  const factors = await client.auth.mfa.listFactors();
  if (factors.error) throw new Error('No se pudieron consultar tus autenticadores. Reintentá.');
  const level = await client.auth.mfa.getAuthenticatorAssuranceLevel();
  if (level.error) throw new Error('No se pudo comprobar la verificación en dos pasos. Reintentá.');
  return {
    factors: factors.data.totp.filter(f => f.status === 'verified'),
    required: (factors.data.all.some(f => f.status === 'verified') || level.data.nextLevel === 'aal2') && level.data.currentLevel !== 'aal2',
  };
}

export async function verificarMfaRecuperacion(client: SupabaseClient, userId: string, factorId: string, code: string) {
  const state = await revisarMfaRecuperacion(client, userId);
  if (!state.factors.some(f => f.id === factorId) || !/^\d{6}$/.test(code)) throw new Error('Elegí un autenticador e ingresá sus seis números.');
  const result = await client.auth.mfa.challengeAndVerify({ factorId, code });
  if (result.error) throw new Error('No se pudo verificar el código. Usá el código actual del autenticador e intentá nuevamente.');
  const checked = await revisarMfaRecuperacion(client, userId);
  if (checked.required) throw new Error('La verificación no se completó. Reintentá.');
}
