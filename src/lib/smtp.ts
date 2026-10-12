export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  auth: { user: string; pass: string };
};

/**
 * Transport config for the contact form, or null when it is not configured yet.
 *
 * Kept out of the route so the one part that fails silently — the port/TLS
 * pairing — is testable without a mail server.
 */
export function smtpConfig(
  env: Record<string, string | undefined>
): SmtpConfig | null {
  const host = env.SMTP_HOST?.trim();
  const user = env.SMTP_USER?.trim();
  const pass = env.SMTP_PASSWORD;
  if (!host || !user || !pass) return null;

  const port = Number(env.SMTP_PORT ?? 465);
  // 465 is implicit TLS, 587 upgrades with STARTTLS. Getting this pair wrong
  // hangs the connection instead of erroring, so it is derived, never typed in.
  return { host, port, secure: port === 465, auth: { user, pass } };
}
