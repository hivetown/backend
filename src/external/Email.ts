import { Transporter, createTransport } from 'nodemailer';
import type { User } from '../entities';

export class Email {
	private transporter: Transporter;
	public constructor(from: string, auth: { user: string; pass: string }) {
		this.transporter = createTransport({
			service: 'gmail',
			from,
			auth
		});

		void this.transporter.verify();
	}

	public async send(to: User, subject: string, text: string): Promise<void> {
		await this.transporter.sendMail({
			to: to.email,
			subject,
			html: this.html(to, text)
		});
	}

	private html(to: User, text: string): string {
		return `
		<html>
			<body>
			<h1>Hi, ${to.name}!</h1>
			<p>${text}</p>

			<div style="
				margin-top: 2rem;
				margin-bottom: 2rem;
				border-top: 1px solid #ccc;
				padding-top: 1rem;">
				<img style="width: 50px" src="/logo.svg" />
				<span style="margin-left: 10px">Sent with ❤️ from HiveTown</span>
			</div>
			</body>
		</html>`;
	}
}
