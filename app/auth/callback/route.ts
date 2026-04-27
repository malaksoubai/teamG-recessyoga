import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/app/server/db';
import { profiles, classTypes, instructorQualifications } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import { type EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const supabase = await createClient();

  // Supabase can send the confirmation link in two formats depending on settings:
  //   PKCE flow  → ?code=...
  //   Legacy     → ?token_hash=...&type=signup
  // Handle both so it works regardless of the Supabase project configuration.

  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  let sessionError: string | null = null;
  let userId: string | null = null;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      sessionError = error.message;
    } else {
      userId = data.session?.user.id ?? null;
    }
  } else if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (error) {
      sessionError = error.message;
    } else {
      userId = data.user?.id ?? null;
    }
  } else {
    sessionError = 'No code or token_hash in callback URL';
  }

  if (sessionError || !userId) {
    console.error('Auth callback error:', sessionError);
    return NextResponse.redirect(`${origin}/sign-up?error=auth_failed`);
  }

  // Get the user to read their metadata.
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/sign-up?error=auth_failed`);
  }

  const metadata = user.user_metadata as {
    firstName?: string;
    lastName?: string;
    phone?: string;
    notificationPreference?: 'email' | 'sms';
    selectedClassTypeNames?: string[];
  };

  // Idempotency guard — safe if the user clicks the link twice.
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (!existing) {
    await db.insert(profiles).values({
      id: user.id,
      firstName: metadata.firstName ?? '',
      lastName: metadata.lastName ?? '',
      email: user.email!,
      phone: metadata.phone ?? null,
      notificationPreference: metadata.notificationPreference ?? 'email',
      approved: false,
      isAdmin: false,
      isActive: true,
    });

    const selectedClassTypeNames = metadata.selectedClassTypeNames ?? [];

    if (selectedClassTypeNames.length > 0) {
      const classTypeRows = await db.query.classTypes.findMany();
      const nameToId = new Map(
        classTypeRows.map((ct) => [ct.name.toLowerCase(), ct.id])
      );

      const qualifications = selectedClassTypeNames
        .map((name) => nameToId.get(name.toLowerCase()))
        .filter((id): id is number => id !== undefined)
        .map((classTypeId) => ({ instructorId: user.id, classTypeId }));

      if (qualifications.length > 0) {
        await db
          .insert(instructorQualifications)
          .values(qualifications)
          .onConflictDoNothing();
      }
    }
  }

  return NextResponse.redirect(`${origin}/pending-approval`);
}
