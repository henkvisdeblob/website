import "server-only";

export type Email = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export interface Mailer {
  send(email: Email): Promise<void>;
}

/** Development only: prints the email (including links) to the server console. */
export class ConsoleMailer implements Mailer {
  public sent: Email[] = [];
  async send(email: Email) {
    this.sent.push(email);
    console.info(`\n[mail] To: ${email.to}\n[mail] Subject: ${email.subject}\n${email.text}\n`);
  }
}

/** Brevo transactional email API (EU provider). */
export class BrevoMailer implements Mailer {
  constructor(
    private apiKey: string,
    private from: { email: string; name: string },
  ) {}

  async send(email: Email) {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": this.apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: this.from,
        to: [{ email: email.to }],
        subject: email.subject,
        htmlContent: email.html,
        textContent: email.text,
      }),
    });
    if (!res.ok) {
      throw new Error(`Brevo send failed: ${res.status} ${await res.text().catch(() => "")}`);
    }
  }
}

const globalForMailer = globalThis as unknown as { __consoleMailer?: ConsoleMailer };

/** Returns the configured mailer, or null in production when email isn't configured. */
export function getMailer(): Mailer | null {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;
  if (apiKey && fromEmail) {
    return new BrevoMailer(apiKey, { email: fromEmail, name: process.env.EMAIL_FROM_NAME ?? "Potje" });
  }
  if (process.env.NODE_ENV === "production" && process.env.WAITLIST_ALLOW_MEMORY_STORE !== "1") {
    return null;
  }
  globalForMailer.__consoleMailer ??= new ConsoleMailer();
  return globalForMailer.__consoleMailer;
}
