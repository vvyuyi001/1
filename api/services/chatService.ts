import { ChatRequest, ChatResponse, Message, Source, Settings } from '../../shared/types';
import { knowledgeStore } from '../storage/store';
import { OpenAI } from '@langchain/openai';

let currentSettings: Settings = {
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiBaseUrl: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com',
  model: 'deepseek-chat',
  temperature: 0.7,
  topK: 5,
};

export class ChatService {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const { question, history } = request;
    
    const sources = await knowledgeStore.similaritySearch(
      question,
      currentSettings.topK
    );

    const context = sources
      .map((s, i) => `[Source ${i + 1} from ${s.documentName}]:\n${s.content}`)
      .join('\n\n');

    let answer = '';
    
    if (sources.length === 0) {
      answer = '知识库中没有找到相关内容。请先上传文档到知识库。';
    } else if (!currentSettings.openaiApiKey) {
      answer = this.generateDemoAnswer(question, sources);
    } else {
      answer = await this.generateAnswer(question, history, context);
    }

    return {
      answer,
      sources: sources.map(s => ({
        documentId: s.documentId,
        documentName: s.documentName,
        content: s.content,
        score: s.score,
      })),
    };
  }

  private generateDemoAnswer(question: string, sources: Source[]): string {
    const docNames = [...new Set(sources.map(s => s.documentName))];
    return `这是一个演示回答。\n\n我在以下文档中找到了与您问题相关的内容：\n${docNames.map(name => `- ${name}`).join('\n')}\n\n请配置 LLM API Key 以获取智能回答。`;
  }

  private async generateAnswer(
    question: string,
    history: Message[],
    context: string
  ): Promise<string> {
    try {
      const llm = new OpenAI({
        openAIApiKey: currentSettings.openaiApiKey,
        configuration: {
          baseURL: currentSettings.openaiBaseUrl,
        },
        modelName: currentSettings.model,
        temperature: currentSettings.temperature,
      });

      const historyText = history
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');

      const prompt = `你是一个智能问答助手，请根据提供的上下文信息回答用户的问题。

上下文信息：
${context}

对话历史：
${historyText}

用户问题：${question}

请用中文回答，并引用相关的来源。如果上下文中没有足够的信息，请如实说明。`;

      const response = await llm.invoke(prompt);
      return typeof response === 'string' ? response : String(response);
    } catch (error) {
      console.error('LLM Error:', error);
      return `生成回答时出错：${error instanceof Error ? error.message : '未知错误'}`;
    }
  }

  updateSettings(settings: Partial<Settings>) {
    currentSettings = { ...currentSettings, ...settings };
    if (settings.openaiApiKey || settings.openaiBaseUrl) {
      knowledgeStore.updateEmbeddings(
        currentSettings.openaiApiKey,
        currentSettings.openaiBaseUrl
      );
    }
  }

  getSettings(): Settings {
    return currentSettings;
  }
}

export const chatService = new ChatService();
