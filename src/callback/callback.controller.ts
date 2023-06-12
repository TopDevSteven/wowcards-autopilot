import { Controller, Get, Query } from '@nestjs/common';

@Controller('callback')
export class CallbackController {
    constructor(
    ){}

    @Get()
    handleCallback(@Query('guid') guid:string){
        console.log(guid)
        return {message: 'Callback received successfully'};
    }
}
