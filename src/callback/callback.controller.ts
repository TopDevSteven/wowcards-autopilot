import { Controller, Get, Query } from '@nestjs/common';

@Controller('callback')
export class CallbackController {
    constructor(
    ){}

    @Get()
    handleCallback(){
        console.log("Go there!!!")
        return {message: 'Callback received successfully'};
    }
}
