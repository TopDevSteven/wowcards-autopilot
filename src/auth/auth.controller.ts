import { Body, Controller, Logger, Post, Req } from "@nestjs/common";
import { wrapResponse } from "../app.controller";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}
}
