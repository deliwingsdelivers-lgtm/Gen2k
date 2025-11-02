/*
  # Create Demo Users

  ## Summary
  Creates three demo user accounts for testing:
  - Server: Arsath Malik (server@bhairuha.local)
  - Kitchen: Bhairuha Kitchen (kitchen@bhairuha.local)
  - Admin: Bhairuha Admin (admin@bhairuha.local)

  All use password: "password" for demo purposes

  Note: This uses the admin API to create users.
  In production, users would sign up through the app.
*/

-- Note: User creation happens via admin API in practice
-- The staff table entries reference auth.users by ID
-- For demo purposes, manually create users in Supabase Auth console
-- Then insert their IDs here

-- Example structure (IDs would be actual UUIDs from auth.users):
-- INSERT INTO staff (id, email, full_name, role, is_active) VALUES
-- ('uuid-server', 'server@bhairuha.local', 'Arsath Malik', 'server', true),
-- ('uuid-kitchen', 'kitchen@bhairuha.local', 'Bhairuha Kitchen', 'kitchen', true),
-- ('uuid-admin', 'admin@bhairuha.local', 'Bhairuha Admin', 'admin', true);

-- For initial demo setup, create placeholder entries that can be updated
-- after users are created in auth
