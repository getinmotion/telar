-- Agregar columna de preferencias de email a user_preferences
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS email_notification_preferences JSONB DEFAULT '{
  "moderation": true,
  "shop": true,
  "products": true,
  "progress": false,
  "account": true,
  "system": true
}'::jsonb;