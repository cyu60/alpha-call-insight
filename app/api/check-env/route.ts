import { NextResponse } from "next/server";

/**
 * Environment Check API Route
 * GET /api/check-env
 *
 * Returns the status of all required environment variables
 * WITHOUT exposing the actual values (for security)
 */
export async function GET() {
  const requiredVars = {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  };

  const optionalVars = {
    GOOGLE_SEARCH_API_KEY: process.env.GOOGLE_SEARCH_API_KEY,
    GOOGLE_SEARCH_ENGINE_ID: process.env.GOOGLE_SEARCH_ENGINE_ID,
  };

  // Create a status report without exposing actual values
  const requiredStatus = Object.entries(requiredVars).reduce(
    (acc, [key, value]) => {
      acc[key] = {
        set: !!value,
        preview: value ? `${value.substring(0, 8)}...` : null,
      };
      return acc;
    },
    {} as Record<string, { set: boolean; preview: string | null }>
  );

  const optionalStatus = Object.entries(optionalVars).reduce(
    (acc, [key, value]) => {
      acc[key] = {
        set: !!value,
        preview: value ? `${value.substring(0, 8)}...` : null,
      };
      return acc;
    },
    {} as Record<string, { set: boolean; preview: string | null }>
  );

  const allRequired = Object.values(requiredVars).every((v) => !!v);
  const missingRequired = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  return NextResponse.json({
    status: allRequired ? "ok" : "missing_required",
    required: requiredStatus,
    optional: optionalStatus,
    missing: missingRequired,
    message: allRequired
      ? "All required environment variables are set"
      : `Missing required variables: ${missingRequired.join(", ")}`,
  });
}
