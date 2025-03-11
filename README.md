# ui-screenshot-to-prompt

> This is an improved version of [s-smits/ui-screenshot-to-prompt](https://github.com/s-smits/ui-screenshot-to-prompt). The main enhancement is replacing the original computer vision-based component detection with LLM (GPT-4V) for more intelligent detection, providing more accurate UI component recognition and analysis capabilities.

ui-screenshot-to-prompt is an AI-powered tool that analyzes UI images to generate detailed prompts for AI coders. It uses OpenAI's Vision API to break down UI components, analyze design patterns, and create comprehensive descriptions for reproducing the design. Very useful for Bolt.new, v0 and other upcoming SaaS.

## Key Improvements from Original Project

- Replaced the original computer vision-based component detection method
- Implemented GPT-4V for smarter component recognition and analysis
- Rewrote the frontend using modern React tech stack
- Enhanced prompt engineering for more accurate component descriptions

## Demo
https://github.com/user-attachments/assets/79c2722e-942d-4f0c-84bd-11066b63f4c5

## Features

- Smart image analysis and component detection using LLM
- UI element classification (buttons, text fields, checkboxes, etc.)
- Individual component analysis
- Overall design pattern analysis
- Modern React web interface for easy usage

## Detailed Usage Guide

### Analysis Modes

The tool uses LLM-based analysis for UI images:

1. **Component Detection**
- Smart component detection using OpenAI Vision API
- Identifies UI elements like buttons, text fields, and checkboxes
- Includes visualization of detected components
- Uses configurable minimum dimensions for component detection

### Component Analysis

Each detected component is analyzed for:
- Component type classification
- Position and dimensions
- Confidence score for detection
- Location and relationship with other components
- Visual styling and design patterns

## Requirements

### API Requirements

The tool requires:

1. **OpenAI API**
- Used for vision analysis through GPT-4V
- Required for component and design analysis
- Supports custom API endpoints for proxy usage

### System Requirements

- Node.js 16+
- npm or yarn
- Modern web browser with JavaScript enabled

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ui-screenshot-to-prompt.git
cd ui-screenshot-to-prompt
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Configure API settings:
- Open the application in your browser
- Navigate to the Settings tab
- Enter your OpenAI API key
- (Optional) Configure custom API endpoint if using a proxy

## Usage

1. Open the application in your web browser (default: http://localhost:5173)

2. Upload an image of a UI design:
   - Click the upload area or drag and drop an image
   - The tool will automatically analyze the image

3. View the analysis results:
   - Main design patterns and choices
   - Individual component breakdown
   - Implementation suggestions
   - Visual hierarchy assessment

## Configuration

You can adjust various parameters in the application settings:

- OpenAI API endpoint
- Vision API parameters
- Component detection settings
- Analysis detail level

The tool uses several prompt templates for analysis:
- System prompts for overall context
- Vision analysis prompts for component detection
- Design analysis prompts for pattern recognition
- Super prompt template for final synthesis

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for GPT-4V model
- React and TypeScript communities
- Original Python version contributors

[![Star History Chart](https://api.star-history.com/svg?repos=s-smits/ui-screenshot-to-prompt&type=Date)](https://star-history.com/#s-smits/ui-screenshot-to-prompt&Date)
