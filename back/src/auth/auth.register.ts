import { randomUUID } from 'crypto';

type RegisterDto = {
  email: string;
  password: string;
  [key: string]: unknown;
};

type RegisterContext = {
  userRepository: any;
  mailService: {
    sendMail: (to: string, subject: string, body: string) => Promise<any>;
  };
};

export async function register(this: RegisterContext, dto: RegisterDto) {
  const user = this.userRepository.create(dto);
  user.verificationToken = randomUUID();
  await this.userRepository.save(user);

  // Enviar email con Resend
  await this.mailService.sendMail(
    user.email,
    'Verifica tu cuenta',
    `<p>Haz clic aquí para verificar: 
    <a href="http://localhost:4200/verify-email?token=${user.verificationToken}">
    Verificar Email</a></p>`
  );

  return { message: 'Usuario creado, revisa tu email' };
}