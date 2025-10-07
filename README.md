# discord-conversation-detector

## 起動方法

1. パッケージのインストール

```bash
$ npm install
```

2. 環境変数の設定

`.env.example`を参照し、`.env.development.local`を作成

3. Neo4jの起動

Neo4j Desktop 2などを使用し、データベースを起動する

4. NestJSローカルサーバーの起動

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## テスト

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
