export interface GoogleAuthResponse {
  iss: string;
  nbf: number;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  azp: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
  jti: string;
}

export interface GoogleLoginRequest {
  token: string;
}

export interface GoogleLoginResponse {
  status: string;
  token: string;
  data: {
    id: string;
    username: string;
    name: string;
    email: string;
    picture: string;
    permission: string;
  };
}
