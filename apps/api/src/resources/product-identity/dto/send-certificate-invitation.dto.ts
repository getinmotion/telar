import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendCertificateInvitationDto {
  @ApiProperty({
    description: 'Email del destinatario para recibir la invitación de certificado',
    example: 'comprador@example.com',
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;
}
