import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiService {
  private readonly ai: GoogleGenAI;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    // APIキーは環境変数 GEMINI_API_KEY から自動読込
    this.ai = new GoogleGenAI({});
    // モデル名はプロトタイプとして固定（必要なら環境変数化可能）
    this.modelName = 'gemini-2.5-flash';
  }

  async summarize(text: string): Promise<string | undefined> {
    if (!text?.trim()) return undefined;
    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `次のテキストを1-2文で日本語で簡潔に要約してください。\n---\n${text}`,
              },
            ],
          },
        ],
      });
      // SDKの返却形に応じてtext()を取得
      // 最新SDKでは response.text() ではなく response.text の場合もあるため両対応は不要なら簡素化
      // ここではサンプルの通り text を参照
      // @ts-ignore
      return response.text;
    } catch (e) {
      // プロトタイプのため最小限のエラーハンドリング
      console.error('[Gemini] Failed to summarize', e);
      return undefined;
    }
  }
}
