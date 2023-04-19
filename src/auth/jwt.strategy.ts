import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { JwtPayload } from "jsonwebtoken";
import jwksRsa from "jwks-rsa";
import { ExtractJwt, Strategy as PassportJwtStrategy } from "passport-jwt";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      userId: string;
      username: string;
      verified: boolean;
      bridgeftUserId?: number;
      firmId: number;
      roles: string[];
    }
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(PassportJwtStrategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${config.get<string>(
          "AUTH0_DOMAIN",
        )}/.well-known/jwks.json`,
      }),
      // Issuer must include trailing slash
      issuer: `https://${config.get<string>(
        "AUTH0_CUSTOM_DOMAIN",
        config.get<string>("AUTH0_DOMAIN", ""),
      )}/`,
      audience: config.get<string>("AUTH0_AUDIENCE"),
      algorithms: ["RS256"],
    });
  }

  async validate(payload: JwtPayload) {
    if (typeof payload.sub === "undefined") {
      throw new Error("User ID not included in JWT payload");
    }

    if (typeof payload.user_roles === "undefined") {
      throw new Error("User Roles not included in JWT payload");
    }

    // Auth0 Access Tokens, which are what their SPA authentication uses, do
    // not include additional details about the user (ex. email). Get that
    // information from the Auth0 Management API after we validate the JWT.

    // const user: Express.User = {
    //   userId: payload.sub,
    //   username: auth0User.email,
    //   verified: auth0User.email_verified || false,
    //   roles: payload.user_roles,
    // };

    // return user;
  }
}
