declare interface NewTestClientOptions {
    endpoint: string;
    keyId: string;
    secretKey: string;
}

declare function newTestClient(options: NewTestClientOptions);
