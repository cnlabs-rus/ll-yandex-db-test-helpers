import {CreateTableInput} from "aws-sdk/clients/dynamodb";

declare interface NewTestClientOptions {
    endpoint: string;
    keyId: string;
    secretKey: string;
}

declare interface NewTestClientHelpers {
    beforeAll(context: any, tables: [CreateTableInput]);

    afterAll(context: any);
}

declare function newTestClient(options: NewTestClientOptions): NewTestClientHelpers;
