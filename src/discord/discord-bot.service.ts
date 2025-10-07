import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import * as GetCommand from './commands/get';

@Injectable()
export class DiscordBotService implements OnModuleInit, OnModuleDestroy {
  private readonly client: Client;
  private readonly token: string;
  private readonly targetChannelId: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    this.token = this.configService.get<string>('DISCORD_BOT_TOKEN') ?? '';
    this.targetChannelId =
      this.configService.get<string>('TARGET_CHANNEL_ID') ?? '';
  }

  async onModuleInit(): Promise<void> {
    if (!this.token || !this.targetChannelId) {
      // プロトタイプのため最小限: 必須設定がなければ起動しない
      console.error(
        '[DiscordBot] Missing DISCORD_BOT_TOKEN or TARGET_CHANNEL_ID',
      );
      return;
    }

    this.wireEventHandlers();
    await this.client.login(this.token);
  }

  onModuleDestroy(): void {
    this.client.destroy();
  }

  private wireEventHandlers(): void {
    this.client.once(Events.ClientReady, async () => {
      console.log(`[DiscordBot] Logged in as ${this.client.user?.tag}`);
      await this.registerCommands();
    });

    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      try {
        if (interaction.commandName === 'get') {
          await GetCommand.execute(
            interaction,
            this.client,
            this.targetChannelId,
          );
        }
      } catch (e) {
        console.error('[DiscordBot] Failed to handle interaction', e);
      }
    });
  }

  private async registerCommands(): Promise<void> {
    try {
      const commands = [GetCommand.data.toJSON()];

      // 即時反映のため参加中Guildにギルドコマンドとして登録（キャッシュに無ければグローバルに）
      const guilds = this.client.guilds.cache;
      if (guilds.size > 0) {
        for (const [guildId] of guilds) {
          await this.client.application?.commands.set(commands, guildId);
          console.log(`[DiscordBot] commands registered for guild ${guildId}`);
        }
      } else {
        await this.client.application?.commands.set(commands);
        console.log('[DiscordBot] commands registered globally');
      }
    } catch (e) {
      console.error('[DiscordBot] Failed to register slash commands', e);
    }
  }
}
