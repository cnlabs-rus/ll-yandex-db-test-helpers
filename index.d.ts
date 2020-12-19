import {CreateTableInput} from "aws-sdk/clients/dynamodb";
import {DynamoDB} from "aws-sdk";

declare module 'll-yandex-db-test-helpers' {
    interface NewTestClientOptions {
        endpoint: string;
        keyId: string;
        secretKey: string;
    }

    class TestClient {
        ydb: DynamoDB;
        constructor(options: NewTestClientOptions);
        createTables(tables: [CreateTableInput]);
        clearAllTables();
        dropTables();
    }
}
