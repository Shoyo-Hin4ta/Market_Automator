-- Create a secure function to encrypt API keys
CREATE OR REPLACE FUNCTION encrypt_api_key(key_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN pgp_sym_encrypt(key_text, current_setting('app.encryption_key'));
END;
$$;

-- Create a secure function to decrypt API keys
CREATE OR REPLACE FUNCTION decrypt_api_key(encrypted_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN pgp_sym_decrypt(encrypted_text::bytea, current_setting('app.encryption_key'));
END;
$$;

-- Revoke direct access to these functions from public
REVOKE ALL ON FUNCTION encrypt_api_key(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION decrypt_api_key(TEXT) FROM PUBLIC;

-- Grant access only to authenticated users
GRANT EXECUTE ON FUNCTION encrypt_api_key(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION decrypt_api_key(TEXT) TO authenticated;