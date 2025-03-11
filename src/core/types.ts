// 基本类型定义

// 检测到的UI元素
export interface UIDetection {
  type: string;
  bbox: [number, number, number, number]; // [x, y, width, height]
  confidence: number;
  text: string;
}

// 检测模式类型
export type DetectionMethod = 'llm';

// 检测器接口
export interface Detector {
  getComponents(): Promise<UIDetection[]> | UIDetection[];
  visualizeDetections(image: ImageData, detections: UIDetection[], outputPath: string): Promise<void>;
}

// API响应类型
export interface AnalysisResponse {
  mainDesign: string;
  componentAnalyses: string[];
  finalAnalysis: string;
}

// 提示详细程度
export type PromptSize = 'concise' | 'extensive';

// 配置选项
export interface ConfigOptions {
  promptSize: PromptSize;
  minComponentWidth: number;
  minComponentHeight: number;
  maxUIComponents: number;
} 
