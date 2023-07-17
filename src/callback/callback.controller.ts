import {
  Controller,
  Get,
  Query,
  Body,
  Post,
  HttpStatus,
  HttpException,
} from "@nestjs/common";
import { now, reject } from "lodash";
import { resolve } from "path";

@Controller("callback")
export class CallbackController {
  constructor() {}

  @Get()
  handleCallback(@Query('guid') guid: string): string {
    try {
      console.log('GUID:', guid);
      // Perform further processing or trigger other actions based on the provided GUID
      // ...
      return 'Callback received successfully';
    } catch (error) {
      throw new HttpException('Error processing callback', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
