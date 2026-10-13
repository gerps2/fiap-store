import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignJWT, jwtVerify, importPKCS8, importSPKI, type JWTPayload, type KeyLike } from 'jose';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { v4 as uuid } from 'uuid';

export interface AccessTokenPayload extends JWTPayload {
  sub: string;
  email: string;
  groups: string[];
}

@Injectable()
export class JwtSignerService implements OnModuleInit {
  private privateKey!: KeyLike;
  private publicKey!: KeyLike;
  private issuer!: string;
  private audience!: string;
  private accessTtlSec!: number;

  constructor(private readonly config: ConfigService) {}

  /** Carrega as chaves ES256 do disco e prepara os parâmetros de assinatura. */
  async onModuleInit(): Promise<void> {
    const privatePath = resolve(this.config.get<string>('JWT_PRIVATE_KEY_PATH', './.keys/es256-private.pem'));
    const publicPath = resolve(this.config.get<string>('JWT_PUBLIC_KEY_PATH', './.keys/es256-public.pem'));
    const privatePem = readFileSync(privatePath, 'utf8');
    const publicPem = readFileSync(publicPath, 'utf8');
    this.privateKey = await importPKCS8(privatePem, 'ES256');
    this.publicKey = await importSPKI(publicPem, 'ES256');
    this.issuer = this.config.get<string>('JWT_ISSUER', 'fiap-store');
    this.audience = this.config.get<string>('JWT_AUDIENCE', 'fiap-store-frontend');
    this.accessTtlSec = Number(this.config.get<string>('JWT_ACCESS_TTL', '900'));
  }

  /** Assina um access token ES256 com claims completas. */
  async signAccess(payload: { sub: string; email: string; groups: string[] }): Promise<string> {
    return new SignJWT({ email: payload.email, groups: payload.groups })
      .setProtectedHeader({ alg: 'ES256', typ: 'JWT' })
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setSubject(payload.sub)
      .setJti(uuid())
      .setIssuedAt()
      .setExpirationTime(`${this.accessTtlSec}s`)
      .sign(this.privateKey);
  }

  /** Valida um access token e retorna o payload tipado. */
  async verify(token: string): Promise<AccessTokenPayload> {
    const { payload } = await jwtVerify(token, this.publicKey, {
      issuer: this.issuer,
      audience: this.audience,
      algorithms: ['ES256'],
    });
    return payload as AccessTokenPayload;
  }
}
