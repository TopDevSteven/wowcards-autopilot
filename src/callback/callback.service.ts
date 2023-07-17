import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import fetch from "node-fetch";

@Injectable()
export class CallbackService {
  constructor(private configService: ConfigService) {}
}
