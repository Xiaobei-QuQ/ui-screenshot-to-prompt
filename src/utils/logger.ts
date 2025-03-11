/**
 * 简单的日志工具
 */

// 日志级别
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// 控制台样式映射
const consoleStyles: Record<LogLevel, string> = {
  debug: 'color: gray',
  info: 'color: blue',
  warn: 'color: orange',
  error: 'color: red; font-weight: bold'
};

// 日志记录接口
interface Logger {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

/**
 * 创建命名日志记录器
 */
export function createLogger(name: string): Logger {
  return {
    debug(message: string): void {
      console.debug(`%c[${name}] ${message}`, consoleStyles.debug);
    },
    
    info(message: string): void {
      console.info(`%c[${name}] ${message}`, consoleStyles.info);
    },
    
    warn(message: string): void {
      console.warn(`%c[${name}] ${message}`, consoleStyles.warn);
    },
    
    error(message: string): void {
      console.error(`%c[${name}] ${message}`, consoleStyles.error);
    }
  };
} 
