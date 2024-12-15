CREATE OR REPLACE FUNCTION set_user_role()
RETURNS TRIGGER AS $$
DECLARE
  email_local_part text;
BEGIN
  -- Extract the local part of the email (before the '@')
  email_local_part := split_part(NEW.email, '@', 1);

  -- Set the role in raw_user_meta_data based on conditions
  IF email_local_part ~ '^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9]+$' THEN
    -- Contains both letters and numbers -> Admin role
    NEW.raw_user_meta_data := jsonb_set(
      COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
      '{role}',
      '"Admin"'
    );
  ELSIF email_local_part ~ '^[A-Za-z]+$' THEN
    -- Contains only letters -> Instructor role
    NEW.raw_user_meta_data := jsonb_set(
      COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
      '{role}',
      '"Instructor"'
    );
  ELSIF email_local_part ~ '^[0-9]+$' THEN
    -- Contains only numbers -> Student role
    NEW.raw_user_meta_data := jsonb_set(
      COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
      '{role}',
      '"Student"'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_role_trigger
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION set_user_role();
