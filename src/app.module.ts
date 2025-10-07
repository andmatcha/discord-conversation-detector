import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { ConfigModule } from '@nestjs/config';
import { DiscordBotService } from '@/discord/discord-bot.service';
import { Neo4jService } from '@/neo4j/neo4j.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.development.local',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, DiscordBotService, Neo4jService],
})
export class AppModule {}
