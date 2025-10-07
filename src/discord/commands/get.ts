import {
  ChannelType,
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
} from 'discord.js';
import { Neo4jService } from '@/neo4j/neo4j.service';

export const data = new SlashCommandBuilder()
  .setName('get')
  .setDescription('TARGET_CHANNEL_ID の最新メッセージを取得してログ出力します');

export async function execute(
  interaction: ChatInputCommandInteraction,
  client: Client,
  targetChannelId: string,
  neo4j?: Neo4jService,
): Promise<void> {
  await interaction.reply({
    content: 'Fetching latest message...',
    ephemeral: true,
  });

  const channel = await client.channels.fetch(targetChannelId);
  if (!channel || channel.type !== ChannelType.GuildText) {
    console.error(
      '[DiscordBot] Target channel not found or not a text channel',
    );
    return;
  }

  const messages = await channel.messages.fetch({ limit: 1 });
  const latest = messages.first();
  if (!latest) {
    console.log('[DiscordBot] No messages found in target channel');
    return;
  }

  console.log('[DiscordBot] Latest message:', {
    id: latest.id,
    authorTag: latest.author?.tag,
    createdAt: latest.createdAt,
    content: latest.content,
  });

  // プロトタイプ: Neo4jService が供給されていれば保存
  if (neo4j) {
    await neo4j.saveMessage({
      id: latest.id,
      content: latest.content,
      createdAtISO: latest.createdAt.toISOString(),
      username: latest.author?.tag ?? 'unknown',
    });
  }

  await interaction.followUp({
    content: 'Logged the latest message to server logs.',
    ephemeral: true,
  });
}
