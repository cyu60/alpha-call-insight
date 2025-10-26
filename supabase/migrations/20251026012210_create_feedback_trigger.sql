-- Create function to trigger feedback email
CREATE OR REPLACE FUNCTION public.trigger_founder_feedback()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Only trigger if conversation has a transcript and email
  IF NEW.transcript IS NOT NULL AND NEW.founder_email IS NOT NULL AND NEW.feedback_sent = false THEN
    -- Get Supabase credentials from environment
    supabase_url := current_setting('app.settings.supabase_url', true);
    service_role_key := current_setting('app.settings.service_role_key', true);

    -- Call the edge function asynchronously using pg_net
    PERFORM
      net.http_post(
        url := supabase_url || '/functions/v1/send-founder-feedback',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
          'conversation_id', NEW.conversation_id
        )
      );

    RAISE LOG 'Triggered feedback email for conversation: %', NEW.conversation_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after conversation insert or update
CREATE TRIGGER send_feedback_on_conversation_complete
  AFTER INSERT OR UPDATE OF transcript, founder_email
  ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_founder_feedback();

-- Add comment for documentation
COMMENT ON TRIGGER send_feedback_on_conversation_complete ON public.conversations IS
'Automatically sends founder feedback email when a conversation is completed and has a transcript';
