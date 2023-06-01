import { Module } from '@nestjs/common';
import { GooglesheetService } from './googlesheet.service';
import { TekmetricModule } from '../tekmetric/tekmetric.module';

@Module({
    imports:[TekmetricModule],
    controllers: [],
    providers: [GooglesheetService],
    exports: [GooglesheetService],
})
export class GooglesheetModule {}
