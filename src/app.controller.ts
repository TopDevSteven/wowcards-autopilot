import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { Public } from "./auth/public.decorator";

export type UnpackPromise<T> = T extends Promise<infer U> ? U : T;
export type UnpackResponse<TFunction extends (...args: any) => any> =
  UnpackPromise<ReturnType<TFunction>>;

export type WrappedApiResponse<TData> = { data: TData };
export function wrapResponse<TData>(
  response: TData,
): WrappedApiResponse<TData> {
  return { data: response };
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  root(): string {
    return this.appService.getHello();
  }
}
