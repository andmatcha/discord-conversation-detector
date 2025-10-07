import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DiscordBotService } from './discord/discord-bot.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.development.local',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, DiscordBotService],
})
export class AppModule {}
