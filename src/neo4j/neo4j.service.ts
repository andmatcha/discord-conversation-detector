import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import neo4j, { Driver } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnModuleDestroy {
  private driver: Driver | null = null;

  constructor(private readonly configService: ConfigService) {
    const uri = this.configService.get<string>('NEO4J_URI');
    const username = this.configService.get<string>('NEO4J_USERNAME');
    const password = this.configService.get<string>('NEO4J_PASSWORD');

    if (uri && username && password) {
      this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
      // 接続確認はプロトタイプのため省略（I/Oは初回クエリ時）
    } else {
      console.warn(
        '[Neo4j] Missing NEO4J_URI/USERNAME/PASSWORD. Persistence is disabled.',
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
    }
  }

  async saveMessage(params: {
    id: string;
    content: string;
    createdAtISO: string;
    username: string;
  }): Promise<void> {
    if (!this.driver) return;
    const session = this.driver.session({
      defaultAccessMode: neo4j.session.WRITE,
    });
    try {
      await session.run(
        `CREATE (m:Message {
          id: $id,
          content: $content,
          createdAt: datetime($createdAtISO),
          username: $username
        }) RETURN m`,
        {
          id: params.id,
          content: params.content,
          createdAtISO: params.createdAtISO,
          username: params.username,
        },
      );
      console.log('[Neo4j] Message saved', { id: params.id });
    } catch (e) {
      console.error('[Neo4j] Failed to save message', e);
    } finally {
      await session.close();
    }
  }
}
