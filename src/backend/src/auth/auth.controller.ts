import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomBytes } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { AuthService, AuthTokens } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { CsrfGuard } from './csrf.guard';

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';
const CSRF_COOKIE = 'csrf_token';

@Controller('auth')
export class AuthController {
  private readonly isProd: boolean;

  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {
    this.isProd = this.config.get<string>('NODE_ENV') === 'production';
  }

  /** Emite um CSRF token (cookie legível + resposta) sem exigir autenticação. */
  @Get('csrf')
  csrf(@Res({ passthrough: true }) res: Response) {
    const token = randomBytes(24).toString('hex');
    res.cookie(CSRF_COOKIE, token, this.cookieOpts({ httpOnly: false }));
    return { csrfToken: token };
  }

  /** Cadastra e já loga. Resposta não inclui accessToken (vai por cookie httpOnly). */
  @Post('signup')
  @HttpCode(201)
  async signup(@Body() dto: SignupDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.auth.signup(dto.email, dto.password);
    this.setSessionCookies(res, tokens);
    return { user: tokens.user };
  }

  /** Autentica por email+senha e emite cookies de sessão. */
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.auth.login(dto.email, dto.password);
    this.setSessionCookies(res, tokens);
    return { user: tokens.user };
  }

  /** Rotaciona o par refresh/access. Exige CSRF. */
  @UseGuards(CsrfGuard)
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshId = (req.cookies as Record<string, string>)?.[REFRESH_COOKIE];
    const tokens = await this.auth.refresh(refreshId);
    this.setSessionCookies(res, tokens);
    return { user: tokens.user };
  }

  /** Revoga refresh atual e limpa todos os cookies da sessão. Exige CSRF. */
  @UseGuards(CsrfGuard)
  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshId = (req.cookies as Record<string, string>)?.[REFRESH_COOKIE];
    await this.auth.logout(refreshId);
    this.clearSessionCookies(res);
  }

  private setSessionCookies(res: Response, tokens: AuthTokens) {
    res.cookie(ACCESS_COOKIE, tokens.accessToken, this.cookieOpts({ httpOnly: true }));
    res.cookie(REFRESH_COOKIE, tokens.refreshTokenId, this.cookieOpts({ httpOnly: true, path: '/auth' }));
    res.cookie(CSRF_COOKIE, tokens.csrfToken, this.cookieOpts({ httpOnly: false }));
  }

  private clearSessionCookies(res: Response) {
    const base = this.cookieOpts({ httpOnly: true });
    res.clearCookie(ACCESS_COOKIE, base);
    res.clearCookie(REFRESH_COOKIE, { ...base, path: '/auth' });
    res.clearCookie(CSRF_COOKIE, this.cookieOpts({ httpOnly: false }));
  }

  private cookieOpts(opts: { httpOnly: boolean; path?: string }) {
    return {
      httpOnly: opts.httpOnly,
      secure: this.isProd,
      sameSite: 'strict' as const,
      path: opts.path ?? '/',
    };
  }
}
