import { UIDetection, AnalysisResponse, DetectionMethod, Detector } from './types'
import { VISION_ANALYSIS_PROMPT, MAIN_DESIGN_ANALYSIS_PROMPT, buildSuperPrompt, setSplittingMode, getSplittingMode, getDetectionTerm, MAX_UI_COMPONENTS } from './config'
import { createLogger } from '../utils/logger'

const logger = createLogger('main')

/**
 * Call vision API (OpenAI etc.)
 */
async function callVisionAPI(
  imageElement: HTMLImageElement,
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.1,
  jsonResponse: boolean = true,
  model: string = 'gpt-4o'
): Promise<string> {
  logger.info(`Calling vision API: ${userPrompt.substring(0, 30)}..., using model: ${model}`)

  try {
    // Convert image to base64 string
    const imageBase64 = await imageToBase64(imageElement)

    // Prepare request messages
    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: userPrompt,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${imageBase64}`,
              detail: 'high',
            },
          },
        ],
      },
    ]

    // Get API key and baseURL
    const apiKey = localStorage.getItem('openai_api_key')
    const baseUrl = localStorage.getItem('openai_base_url') || 'https://api.openai.com/v1'

    if (!apiKey) {
      throw new Error('OpenAI API key not set. Please configure it in settings.')
    }

    // Prepare request options
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 1024,
        temperature: temperature,
        response_format: jsonResponse ? { type: 'json_object' } : undefined,
      }),
    }

    // Send request
    const response = await fetch(`${baseUrl}/chat/completions`, requestOptions)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`API response error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content.trim()
  } catch (error) {
    logger.error(`Vision API call failed: ${error instanceof Error ? error.message : String(error)}`)
    throw error
  }
}

/**
 * Convert HTML image element to base64 string
 */
async function imageToBase64(imageElement: HTMLImageElement): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Create canvas element
      const canvas = document.createElement('canvas')
      canvas.width = imageElement.naturalWidth || imageElement.width
      canvas.height = imageElement.naturalHeight || imageElement.height

      // Draw image to canvas
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not create canvas context'))
        return
      }

      ctx.drawImage(imageElement, 0, 0)

      // Get base64 data from canvas
      // Remove data:image/png;base64, prefix
      const dataUrl = canvas.toDataURL('image/png')
      const base64 = dataUrl.split(',')[1]
      resolve(base64)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Analyze main design choices
 */
async function analyzeMainDesignChoices(imageElement: HTMLImageElement, temp: number = 0.1): Promise<string> {
  logger.info('Analyzing main design choices')

  try {
    return await callVisionAPI(
      imageElement,
      MAIN_DESIGN_ANALYSIS_PROMPT,
      'Analyze the complete design system and structure of this interface.',
      temp,
      false,
      'gpt-4o'
    )
  } catch (e) {
    logger.error(`Error analyzing main design: ${e}`)
    return 'Error analyzing main design structure'
  }
}

/**
 * Describe activity shown in the image
 */
async function describeActivity(imageElement: HTMLImageElement): Promise<string> {
  logger.info('Describing activity in image')

  return callVisionAPI(
    imageElement,
    'Describe this webpage activity in a few sentences.',
    'What activity is shown in this image?',
    0.1,
    false,
    'gpt-4o'
  )
}

/**
 * Analyze single detection (region/component)
 */
async function analyzeDetection(detectionImage: HTMLImageElement, index: number, location: string): Promise<string> {
  const detectionTerm = getDetectionTerm()
  logger.info(`Analyzing ${detectionTerm} ${index} at ${location}`)

  const prompt = `Analyze this UI ${detectionTerm}:
  - Location: ${location}
  - ${detectionTerm.charAt(0).toUpperCase() + detectionTerm.slice(1)} number: ${index}
  
  Provide structured analysis following the JSON schema in system prompt.
  Focus on implementation-relevant details.`

  const analysis = await callVisionAPI(detectionImage, VISION_ANALYSIS_PROMPT, prompt, 0.1, true, 'gpt-4o')

  return `[Location: ${location}]\n${analysis}`
}

/**
 * Create super prompt and call API
 */
async function callSuperPrompt(mainImageCaption: string, componentCaptions: string[], activityDescription: string): Promise<string> {
  try {
    // Build base super prompt
    const superPrompt = buildSuperPrompt(mainImageCaption, componentCaptions, activityDescription)

    // Clean prompt
    const cleanedPrompt = superPrompt
      .split('\n')
      .slice(1, -1)
      .filter((line) => line.trim())
      .join('\n')
      .trim()

    // Add "Build this app:" prefix
    const finalPrompt = `Build this app: ${cleanedPrompt}`

    logger.info(`Generated super prompt: ${finalPrompt.substring(0, 100)}...`)

    // Mock API call - actual implementation will call appropriate API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`This is a mock super prompt response based on: ${finalPrompt.substring(0, 50)}...`)
      }, 1500)
    })
  } catch (e) {
    logger.error(`Super prompt generation error: ${e}`)
    throw e
  }
}

/**
 * Create LLM-based UI component detector
 * Use vision API to analyze interface components
 */
export function createDetector(method: DetectionMethod, imageElement: HTMLImageElement, maxComponents: number = MAX_UI_COMPONENTS): Detector {
  const logger = createLogger('llm-detector')
  logger.info(`Creating LLM detector, max components: ${maxComponents}`)

  return {
    async getComponents(): Promise<UIDetection[]> {
      const detectionTerm = getDetectionTerm()
      logger.info(`Using LLM to analyze image and detect ${detectionTerm}s`)

      // LLM detection uses unified prompt template
      const prompt = `Analyze this UI interface and identify up to ${maxComponents} UI components.
      For each component, provide the following information:
      1. Location description (e.g., "top left", "bottom center of page", etc.)
      2. Component type (e.g., button, input field, navigation bar, icon, etc.)
      3. Bounding box estimation (relative to entire image, x,y coordinates of top-left corner and width, height in pixels)
      4. Component confidence (0.0 to 1.0)
      5. Component text content (if visible)
      
      Return results in JSON format:
      {
        "components": [
          {
            "id": numeric ID,
            "type": "component type",
            "location": "location description",
            "bbox": [x, y, width, height],
            "confidence": confidence,
            "text": "text content"
          }
        ]
      }`

      try {
        // Call vision API for component analysis
        const response = await callVisionAPI(
          imageElement,
          `As a UI analysis expert, identify ${detectionTerm}s in the interface.`,
          prompt,
          0.2,
          true,
          'gpt-4o'
        )

        // Parse JSON response
        const parsedResponse = JSON.parse(response)
        const items = parsedResponse.components || []

        if (!items.length) {
          logger.warn(`LLM detected no ${detectionTerm}s`)
          return []
        }

        // Convert LLM response to UIDetection format
        return items.slice(0, maxComponents).map((item: any, index: number) => {
          // Ensure bbox is array format
          const bbox = Array.isArray(item.bbox) ? item.bbox : item.box ? [item.box.x || 0, item.box.y || 0, item.box.width || 0, item.box.height || 0] : [0, 0, 0, 0]

          return {
            type: item.type || 'component',
            bbox: bbox as [number, number, number, number],
            confidence: item.confidence || 1.0,
            text: item.text || item.location || `${detectionTerm} ${index}`,
          }
        })
      } catch (e) {
        logger.error(`LLM ${detectionTerm} detection failed: ${e}`)
        return []
      }
    },

    // Implement visualization method required by Detector interface
    async visualizeDetections(image: ImageData, detections: UIDetection[], outputPath: string): Promise<void> {
      logger.info(`Visualizing ${detections.length} detections, output path: ${outputPath}`)
    },
  }
}

/**
 * Process image - main entry point
 */
export async function processImage(image: HTMLImageElement, minArea?: number, maxDetections: number = MAX_UI_COMPONENTS): Promise<AnalysisResponse> {
  try {
    logger.info('Starting image processing')

    // Use our new LLM detector
    const detector = createDetector(getSplittingMode(), image, maxDetections)

    // Get detections
    const detections = await detector.getComponents()

    if (!detections.length) {
      logger.error(`No ${getDetectionTerm()}s detected. Exiting processing.`)
      return {
        mainDesign: `No ${getDetectionTerm()}s detected.`,
        componentAnalyses: [],
        finalAnalysis: 'Error during analysis',
      }
    }

    // First analyze the main image
    const mainDesignChoices = await analyzeMainDesignChoices(image)
    const activityDescription = await describeActivity(image)

    // Prepare detection analysis parameters
    const detectionAnalyses: string[] = []

    // This would be more complex in a real application, needing to handle cropped images
    // Using a simplified implementation here
    for (let i = 0; i < detections.length; i++) {
      const detection = detections[i]
      // Simulate cropping the detection box from the main image
      const analysisResult = await analyzeDetection(
        image, // In a real implementation, this would be the cropped image
        i,
        detection.text
      )
      detectionAnalyses.push(analysisResult)
    }

    // Build and call super prompt
    const finalAnalysis = await callSuperPrompt(mainDesignChoices, detectionAnalyses, activityDescription)

    logger.info('Image processing completed successfully')
    return {
      mainDesign: mainDesignChoices,
      componentAnalyses: detectionAnalyses,
      finalAnalysis,
    }
  } catch (e) {
    logger.error(`Error processing image: ${e}`)
    return {
      mainDesign: 'Error processing image',
      componentAnalyses: [],
      finalAnalysis: 'Error during analysis',
    }
  }
}

/**
 * Launch React interface (simplified example)
 * In actual application, this would export components instead of a launch function
 */
export function launchInterface(): void {
  logger.info('React version will launch interface here')
  console.log('Launching UI Screenshot to Prompt Generator interface')
}

/**
 * Process image with React interface
 * Will be integrated with React components in TypeScript implementation
 */
export async function reactProcessImage(
  image: HTMLImageElement,
  splittingMode: DetectionMethod,
  maxComponents: number = MAX_UI_COMPONENTS
): Promise<{
  finalAnalysis: string
  output: string
  visualizationImage?: string
}> {
  logger.info(`Processing image uploaded through React interface, splitting mode: ${splittingMode}`)

  // Set detection method
  setSplittingMode(splittingMode)

  // Process image
  const { mainDesign, componentAnalyses, finalAnalysis } = await processImage(image, undefined, maxComponents)

  // Get detection term
  const detectionTerm = getDetectionTerm()

  // Prepare output
  const output =
    `**Main Design Choices:**\n${mainDesign}\n\n` +
    `**${detectionTerm.charAt(0).toUpperCase() + detectionTerm.slice(1)} Analysis:**\n` +
    componentAnalyses.map((analysis, i) => `**${detectionTerm.charAt(0).toUpperCase() + detectionTerm.slice(1)} ${i}:** ${analysis}\n`).join('') +
    `\n**Final Analysis:**\n${finalAnalysis}`

  return {
    finalAnalysis,
    output,
    // In actual implementation, this would be visualization image URL or data URL
    visualizationImage: 'visualization_image_url', // Always provide visualization in LLM mode
  }
}
