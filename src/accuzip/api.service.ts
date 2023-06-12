import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import fetch from "node-fetch";
import HttpsProxyAgent from "https-proxy-agent";

type RawAddress = {
    street: string,
    city: string,
    state: string,
    zip: string,
}

@Injectable()
export class AccuzipApiService {
    constructor(
        private configService: ConfigService,
    ) {}

    async ncoaApi() {
        const apiKey = `${this.configService.get<string>("ACCUZIP_API_KEY")}`;
        const accuzipApiUrl = 'https://cloud2.iaccutrace.com/servoy-service/rest_ws/ws_360/v2_0/INFO';
        const response = await fetch(accuzipApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "apiKey": `${apiKey}`,
            }),
            agent: HttpsProxyAgent(
                "http://14a6bcbf08595:82a07ac06c@115.167.16.89:12323",
              ),
        });

        if (!response.ok) {
            throw new Error(`Http error! status: ${response.status}`)
        }

        return response.json();
    }
}