-- Fix handle_new_user trigger to correctly pull name from OAuth provider metadata.
-- Google OAuth sends 'name' (not 'full_name') in raw_user_meta_data.
-- LinkedIn OIDC sends 'full_name'. This fix handles both.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', ''),
        COALESCE(
            NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
            NULLIF(NEW.raw_user_meta_data->>'name', ''),
            ''
        ),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
