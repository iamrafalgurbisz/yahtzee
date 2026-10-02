import { Injectable, OnApplicationShutdown } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createTransport, type Transporter } from "nodemailer";

@Injectable()
export class MailService implements OnApplicationShutdown {
  #transporter: Transporter;
  #from: string;
  #clientUrl: string;

  constructor(config: ConfigService) {
    const get = (key: string) => config.get<string>(key) || undefined;
    const required = (key: string) => {
      const value = get(key);
      if (!value) throw new Error(`Missing env variable: ${key}`);
      return value;
    };

    const port = Number(get("SMTP_PORT") ?? 587);
    const user = get("SMTP_USER");

    this.#transporter = createTransport({
      host: required("SMTP_HOST"),
      port,
      secure: port === 465,
      auth: user ? { user, pass: get("SMTP_PASS") } : undefined,
    });
    this.#from = required("MAIL_FROM");
    this.#clientUrl = get("CLIENT_URL") ?? "http://localhost:3001";
  }

  async sendEmailVerification(to: string, displayName: string, token: string) {
    const link = `${this.#clientUrl}/verify-email?token=${token}`;

    await this.#transporter.sendMail({
      from: this.#from,
      to,
      subject: "Activate your Yahtzee account",
      text: `Hi ${displayName}!\n\nTo activate your account, open this link:\n${link}\n\nThe link expires in 24 hours.`,
      html: `<p>Hi ${escapeHtml(displayName)}!</p>
<p>To activate your account, click the link below:</p>
<p><a href="${link}">Activate account</a></p>
<p>The link expires in 24 hours.</p>`,
    });
  }

  onApplicationShutdown() {
    this.#transporter.close();
  }
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
