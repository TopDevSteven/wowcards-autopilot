import { Controller, Get, Query , Body, Post, HttpStatus, HttpException} from '@nestjs/common';
import { now, reject } from 'lodash';
import { resolve } from 'path';

@Controller('callback')
export class CallbackController {
    constructor(
    ){}

    @Post()
    handleCallback(@Body() data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                console.log(data)

                resolve({ status: "ok"})
            } catch (error) {
                reject({status: 'Error', message: 'Error processing callback'})
            }
        })
    }
}
