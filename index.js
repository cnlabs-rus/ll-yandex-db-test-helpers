const AWS = require('aws-sdk');

module.exports = {
    newTestClient({endpoint, keyId, secretKey}) {
        return {
            beforeAll: async (context, tableDefinitions) => {
                context.ydb = new AWS.DynamoDB({
                    region: 'us-east-1',
                    endpoint,
                    accessKeyId: keyId,
                    secretAccessKey: secretKey,
                });
                context.tables = [];
                process.env.YDB_PREFIX = (process.env.CI_PROJECT_NAME || process.env.USER) + '/' + new Date().toISOString().replace(/[:.]/g, "-") + "/";
                await Promise.all(tableDefinitions.map(d => new Promise((resolve, reject) => context.ydb.createTable(
                    d,
                    (err, data) => {
                        if (err) {
                            reject(err);
                        } else {
                            context.tables.push(data.TableDescription.TableName);
                            resolve(data.TableDescription);
                        }
                    })
                )));
                while (1) {
                    const nonActiveStatuses = (await Promise.all(context.tables.map(v => new Promise((resolve, reject) => {
                        context.ydb.describeTable({TableName: v}, (e, d) => {
                            if (e) {
                                reject(e);
                            } else {
                                resolve(d.Table);
                            }
                        })
                    })))).filter(v => v.TableStatus !== 'ACTIVE');
                    if (!nonActiveStatuses.length) {
                        break;
                    }
                }
                console.log("Created tables: ", context.tables.join(", "));
            },
            afterAll: async (context) => {
                await Promise.all(this.tables.map(v => new Promise((resolve, reject) => {
                    context.ydb.deleteTable({TableName: v}, (e, d) => {
                        if (e) {
                            reject(e);
                        } else {
                            resolve(d.TableDescription);
                        }
                    })
                })));
                while (1) {
                    const deleted = (await Promise.all(this.tables.map(v => new Promise((resolve, reject) => {
                        context.ydb.describeTable({TableName: v}, (e, d) => {
                            resolve(!!e)
                        });
                    }))));
                    if (!isNotExists.find(deleted => !deleted)) {
                        break;
                    }
                }
            },
        }
    }
};
