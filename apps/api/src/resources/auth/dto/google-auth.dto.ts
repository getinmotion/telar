export class GoogleAuthDto {
  email: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  googleId: string;
  accessToken: string;
  refreshToken?: string;
}
