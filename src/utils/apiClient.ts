import { createLogger } from './logger'

const logger = createLogger('apiClient')

interface ChatMessageContent {
  type: 'text' | 'image_url' | 'image'
  text?: string
  image_url?: { url: string }
  source?: { type: 'base64'; media_type: string; data: string }
}

interface ChatMessage {
  role: 'system' | 'user'
  content: string | ChatMessageContent[]
}

// Supported API providers
export type ApiProvider = 'openai' | 'anthropic'

// API configuration
interface ApiConfig {
  provider: ApiProvider
  apiKey: string
  endpoint?: string
  model?: string
}

// API request options
interface ApiRequestOptions {
  systemPrompt?: string
  userPrompt: string
  temperature?: number
  jsonResponse?: boolean
  maxTokens?: number
  image?: HTMLImageElement
}

/**
 * API Client class
 */
export class ApiClient {
  private config: ApiConfig

  constructor(config: ApiConfig) {
    this.config = config
  }

  /**
   * Create configuration from user settings
   */
  static fromUserSettings(provider: ApiProvider = 'openai'): ApiClient {
    const apiKey = localStorage.getItem(`${provider}_api_key`) || ''

    if (!apiKey) {
      logger.warn(`API key not found for ${provider}`)
    }

    return new ApiClient({
      provider,
      apiKey,
      model: provider === 'openai' ? 'gpt-4-vision-preview' : 'claude-3-opus-20240229',
    })
  }

  /**
   * Execute API call
   */
  async call(options: ApiRequestOptions): Promise<string> {
    const { systemPrompt, userPrompt, temperature = 0.1, jsonResponse = false, maxTokens = 2048, image } = options

    if (!this.config.apiKey) {
      throw new Error(`API key not set for ${this.config.provider}`)
    }

    logger.info(`Calling ${this.config.provider} API: ${userPrompt.substring(0, 30)}...`)

    try {
      // Build request based on provider
      if (this.config.provider === 'openai') {
        return await this.callOpenAI(systemPrompt, userPrompt, temperature, maxTokens, image)
      } else if (this.config.provider === 'anthropic') {
        return await this.callAnthropic(systemPrompt, userPrompt, temperature, maxTokens, image)
      } else {
        throw new Error(`Unsupported API provider: ${this.config.provider}`)
      }
    } catch (error) {
      logger.error(`API call failed: ${error}`)
      throw error
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(systemPrompt?: string, userPrompt?: string, temperature: number = 0.1, maxTokens: number = 2048, image?: HTMLImageElement): Promise<string> {
    const endpoint = this.config.endpoint || 'https://api.openai.com/v1/chat/completions'
    const model = this.config.model || 'gpt-4-vision-preview'

    const messages: ChatMessage[] = []

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: [
          {
            type: 'text',
            text: systemPrompt,
          },
        ],
      })
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: [],
    }

    if (userPrompt) {
      ;(userMessage.content as ChatMessageContent[]).push({
        type: 'text',
        text: userPrompt,
      })
    }

    if (image) {
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('canvas context not found')
      }

      ctx.drawImage(image, 0, 0)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      const base64Image = dataUrl.split(',')[1]

      ;(userMessage.content as ChatMessageContent[]).push({
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${base64Image}`,
        },
      })
    }

    messages.push(userMessage)

    // Build request
    const requestBody = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }

    // Send request
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  /**
   * Call Anthropic API
   */
  private async callAnthropic(systemPrompt?: string, userPrompt?: string, temperature: number = 0.1, maxTokens: number = 2048, image?: HTMLImageElement): Promise<string> {
    const endpoint = this.config.endpoint || 'https://api.anthropic.com/v1/messages'
    const model = this.config.model || 'claude-3-opus-20240229'

    // Prepare messages
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: [],
      },
    ]

    if (userPrompt) {
      ;(messages[0].content as ChatMessageContent[]).push({
        type: 'text',
        text: userPrompt,
      })
    }

    // Add image
    if (image) {
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Canvas context not found')
      }

      ctx.drawImage(image, 0, 0)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      const base64Image = dataUrl.split(',')[1]

      ;(messages[0].content as ChatMessageContent[]).push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: base64Image,
        },
      })
    }

    // Build request
    const requestBody: any = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }

    // Add system prompt (if exists)
    if (systemPrompt) {
      requestBody.system = systemPrompt
    }

    // Send request
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Anthropic API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    return data.content[0].text
  }
}
