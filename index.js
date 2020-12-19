const YandexDB = require('@cnlabs/yandexdb-rest');

module.exports = {
    TestClient: class {
        constructor({endpoint, keyId, secretKey}) {
            process.env.YDB_PREFIX = (process.env.CI_PROJECT_NAME || process.env.USER) + '/' + new Date().toISOString().replace(/[:.]/g, "-") + "/";
            this.ydb = new YandexDB({
                endpoint, keyId, secretKey, verbose: true
            });
        }

        async createTables(tableDefinitions) {
            this.lastTableDefinitions = tableDefinitions;
            this.tables = [];
            await Promise.all(tableDefinitions.map(d => this.ydb.query('CreateTable', d).then(({TableDescription}) => {
                this.tables.push(TableDescription.TableName);
                return TableDescription;
            })));
            while (1) {
                const nonActiveStatuses = (await Promise.all(this.tables.map(v => {
                    this.ydb.query('DescribeTable', {TableName: v}).then(({Table}) => Table);
                }))).filter(v => v.TableStatus !== 'ACTIVE');
                if (!nonActiveStatuses.length) {
                    break;
                }
            }
            console.log("Created tables: ", this.tables.join(", "));
        }

        async dropTables() {
            await this.ydb.query('DeleteTable', {TableName: v});

            while (1) {
                const deleted = await Promise.all(this.tables.map(v => this.ydb.query('DescribeTable', ({TableName: v}))));
                if (!deleted.find(deleted => !deleted)) {
                    break;
                }
            }
        }

        async clearAllTables() {
            if (this.lastTableDefinitions) {
                this.dropTables();
                this.createTables(this.lastTableDefinitions)
            }
        }
    }
};
