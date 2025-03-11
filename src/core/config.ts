import { DetectionMethod, PromptSize } from './types';
import { createLogger } from '../utils/logger';

// Initialize logger
const logger = createLogger('config');

// Global configuration variables
let DETECTION_METHOD: DetectionMethod = 'llm';
let DETECTION_TERM = 'component'; // Always 'component' when using LLM detection
let PROMPT_CHOICE: PromptSize = 'concise';

// Default component dimensions
export const MIN_COMPONENT_WIDTH_ADVANCED = 50;
export const MIN_COMPONENT_HEIGHT_ADVANCED = 50;
export const MAX_UI_COMPONENTS = 6;

export const MIN_REGION_WIDTH_SIMPLE = 200;
export const MIN_REGION_HEIGHT_SIMPLE = 200;

// Export constants for external use
export const MIN_COMPONENT_WIDTH = MIN_COMPONENT_WIDTH_ADVANCED;
export const MIN_COMPONENT_HEIGHT = MIN_COMPONENT_HEIGHT_ADVANCED;

// System prompt
export const SYSTEM_PROMPT = `You are an expert UI/UX analyst creating structured design specifications.`;

/**
 * Update the detection method configuration
 */
export function setSplittingMode(method: DetectionMethod): void {
  // LLM detection mode doesn't need to distinguish between basic and advanced
  DETECTION_METHOD = method;
  DETECTION_TERM = 'component'; // Always use component terminology
  logger.info(`Detection method set to: ${DETECTION_METHOD}`);
}

/**
 * Get current detection method
 */
export function getSplittingMode(): DetectionMethod {
  return DETECTION_METHOD;
}

/**
 * Get current detection terminology
 */
export function getDetectionTerm(): string {
  return DETECTION_TERM;
}

/**
 * Set prompt choice configuration
 */
export function setPromptChoice(choice: PromptSize): void {
  if (choice !== 'concise' && choice !== 'extensive') {
    throw new Error("Invalid prompt choice. Must be 'concise' or 'extensive'");
  }
  PROMPT_CHOICE = choice;
  logger.info(`Prompt choice set to: ${PROMPT_CHOICE}`);
}

/**
 * Get current prompt choice
 */
export function getPromptChoice(): PromptSize {
  return PROMPT_CHOICE;
}

/**
 * Initialize API clients - This will be reimplemented to use Web API calls
 */
export async function initializeClients() {
  // In the TypeScript version, we'll use the fetch API to call external services
  // This replaces the OpenAI and Anthropic client initialization in the Python version
  logger.info("Initializing API clients");
  
  // Check if API key exists
  const apiKey = localStorage.getItem('openai_api_key') || '';
  if (!apiKey) {
    logger.warn("API key not set");
  }
  
  return {
    apiKey,
    hasValidKey: Boolean(apiKey)
  };
}

// Vision analysis prompt
export const VISION_ANALYSIS_PROMPT = `You are an expert AI system analyzing UI components for development replication.

COMPONENT ANALYSIS REQUIREMENTS:
{
    "type": "Identify component type (button/input/card/etc)",
    "visual": {
        "colors": ["primary", "secondary", "text"],
        "dimensions": "size and spacing",
        "typography": "font styles and weights",
        "borders": "border styles and radius",
        "shadows": "elevation and depth"
    },
    "content": {
        "text": "content and labels",
        "icons": "icon types if present",
        "images": "image content if present"
    },
    "interaction": {
        "primary": "main interaction type",
        "states": ["hover", "active", "disabled"],
        "animations": "transitions and effects"
    },
    "location": {
        "position": "relative to parent/siblings",
        "alignment": "layout alignment",
        "spacing": "margins and padding"
    }
}

OUTPUT FORMAT:
{
    "component": "technical name (<5 words)",
    "specs": {
        // Fill above structure with detected values
    },
    "implementation": "key technical considerations (<15 words)"
}`;

// Main design analysis prompt
export const MAIN_DESIGN_ANALYSIS_PROMPT = `You are an expert UI/UX analyst creating structured design specifications.

ANALYZE AND OUTPUT THE FOLLOWING JSON STRUCTURE:
{
    "layout": {
        "pattern": "primary layout system (grid/flex/etc)",
        "structure": {
            "sections": ["header", "main", "footer", etc],
            "columns": {
                "count": "number of columns",
                "sizes": "column width distributions"
            },
            "elements": {
                "boxes": "count and arrangement",
                "circles": "diameter and placement"
            }
        },
        "spacing": {
            "between_sections": "major gaps",
            "between_elements": "element spacing"
        },
        "responsive_hints": "visible breakpoint considerations"
    },
    "design_system": {
        "colors": {
            "primary": "main color palette",
            "secondary": "supporting colors",
            "text": "text hierarchy colors",
            "background": "surface colors",
            "interactive": "button/link colors"
        },
        "typography": {
            "headings": "heading hierarchy",
            "body": "body text styles",
            "special": "distinctive text styles"
        },
        "components": {
            "shadows": "elevation levels",
            "borders": "border styles",
            "radius": "corner rounding"
        }
    },
    "interactions": {
        "buttons": {
            "types": "button variations",
            "states": "visible states (hover/disabled)"
        },
        "inputs": "form element patterns",
        "feedback": "visible status indicators"
    },
    "content": {
        "media": {
            "images": "image usage patterns",
            "aspect_ratios": "common ratios"
        },
        "text": {
            "lengths": "content constraints",
            "density": "text distribution"
        }
    },
    "visual_hierarchy": {
        "emphasis": "attention hierarchy",
        "flow": "visual reading order",
        "density": "content distribution"
    },
    "implementation_notes": "key technical considerations (<30 words)"
}`;

/**
 * Build super prompt
 */
export function buildSuperPrompt(
  mainImageCaption: string,
  regionDescriptions: string[],
  activityDescription: string,
  promptSize: PromptSize = 'concise'
): string {
  // Get current detection terminology
  const detectionTerm = getDetectionTerm();
  
  // Build region specifications string with proper terminology
  const regionSpecs = regionDescriptions.map((desc, i) => 
    `${detectionTerm.charAt(0).toUpperCase() + detectionTerm.slice(1)} ${i + 1}: ${desc}`
  ).join("\n");

  // Format main caption if not empty
  const layoutSection = mainImageCaption || "No layout analysis available";

  if (promptSize === 'concise') {
    return `This study presents a systematic analysis framework for precise UI replication, incorporating component specifications and visual hierarchy assessment. The framework examines:

    [${detectionTerm.charAt(0).toUpperCase() + detectionTerm.slice(1)} Analysis]
    ${regionSpecs}

    [Layout Analysis]
    ${layoutSection}

    [Interactive Elements]
    ${activityDescription}

    Technical Specifications for Implementation:

    1. Layout Architecture
    - Container dimensions and responsive breakpoints
    - Component positioning matrix including:
        • Primary sections (header, content, footer)
        • Grid system specifications
        • Spatial relationships and padding metrics

    2. Visual Parameters
    - Color schema (primary, secondary, accent)
    - Typography specifications
    - Elevation system (shadows, borders)

    3. Component Specifications
    - Interactive controls
    - Static elements
    - State representations

    4. Content Parameters
    - Text constraints and overflow behavior
    - Media dimensions and ratios
    - Component hierarchy

    This framework enables precise replication while maintaining structural integrity and interactive functionality across various viewport dimensions.
    `;
  } else {
    return `You are an expert UI development agent tasked with providing exact technical specifications for recreating this interface. Analyze all details with high precision:

    [Components Specifications by Location]
    ${regionSpecs}

    [Layout Structure]
    ${layoutSection}

    [Interaction Patterns]
    ${activityDescription}

    Note: If a component has already been explained in detail above, only its name and location will be listed below to provide geographical context.

    Provide a complete technical specification for exact replication in text format:

    1. Layout Structure
    - Primary container dimensions
    - Component positioning map:
        • Header, main content, sidebars, footer
        • Layout elements:
            - Number and size of columns (e.g., 3 columns at 33% each)
            - Number and height of rows
            - Grid/box count and arrangement
            - Circular elements diameter and placement
        • Spacing and gaps:
            - Between major sections
            - Between grid items
            - Inner padding
    - Responsive behavior:
        • Breakpoint dimensions
        • Layout changes at each breakpoint
        • Element reflow rules
    
    2. Visual Style
    - Colors:
        • Primary, secondary, accent colors
        • Background colors
        • Text colors
        • Border colors
    - Typography:
        • Font sizes
        • Text weights
        • Text alignment
    - Depth and Emphasis:
        • Visible shadows
        • Border styles
        • Opacity levels
    
    3. Visible Elements
    - Controls:
        • Button appearances (if new, otherwise location only)
        • Form element styling (if new, otherwise location only)
        • Interactive element looks (if new, otherwise location only)
    - Static Elements:
        • Images and icons (if new, otherwise location only)
        • Text content (if new, otherwise location only)
        • Decorative elements (if new, otherwise location only)
    - Visual States:
        • Active/selected states
        • Disabled appearances
        • Current page indicators
    
    4. Content Presentation
    - Text:
        • Visible length limits
        • Current overflow handling
        • Text wrapping behavior
    - Media:
        • Image dimensions
        • Aspect ratios
        • Current placeholder states
    
    5. Visual Hierarchy
    - Element stacking
    - Content grouping
    - Visual emphasis
    - Spatial relationships between previously described components
    `;
  }
} 
