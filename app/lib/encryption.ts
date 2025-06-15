import { createClient } from './supabase/server'

/**
 * Encrypts an API key using Supabase's pgcrypto extension
 * Note: The actual encryption key should be set as a Supabase secret
 */
export async function encryptApiKey(key: string): Promise<string> {
  const supabase = await createClient()
  
  // For now, we'll use direct pgp_sym_encrypt with a hardcoded key
  // In production, this should use Supabase Vault or environment secrets
  const { data, error } = await supabase
    .rpc('pgp_sym_encrypt', {
      data: key,
      psw: process.env.SUPABASE_SERVICE_ROLE_KEY || 'temp-encryption-key'
    })
  
  if (error) throw error
  return data
}

/**
 * Decrypts an API key using Supabase's pgcrypto extension
 */
export async function decryptApiKey(encryptedKey: string): Promise<string> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .rpc('pgp_sym_decrypt', {
      data: encryptedKey,
      psw: process.env.SUPABASE_SERVICE_ROLE_KEY || 'temp-encryption-key'
    })
  
  if (error) throw error
  return data
}