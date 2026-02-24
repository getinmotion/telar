type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  userEmail?: string;
  action?: string;
  component?: string;
  [key: string]: any;
}

// Production mode detection
const isProduction = !import.meta.env.DEV;

// OPTIMIZATION: Suppress all console.log in production
if (isProduction) {
  const noop = () => {};
  console.log = noop;
  console.debug = noop;
  console.info = noop;
  console.group = noop;
  console.groupEnd = noop;
  console.groupCollapsed = noop;
  console.table = noop;
  console.time = noop;
  console.timeEnd = noop;
  console.trace = noop;
  // Keep console.warn and console.error for critical issues
}

// Development-only loggers (no-op in production)
export const devLog = isProduction ? () => {} : console.log.bind(console);
export const devWarn = isProduction ? () => {} : console.warn.bind(console);
export const devError = console.error.bind(console); // Always active

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      devLog(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      devLog(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = error ? { ...context, error: error.message, stack: error.stack } : context;
    console.error(this.formatMessage('error', message, errorContext));
  }

  // Security-specific logging methods
  security = {
    loginAttempt: (email: string, success: boolean, ip?: string) => {
      this.info('Login attempt', {
        action: 'login_attempt',
        userEmail: email,
        success,
        ip,
        component: 'auth'
      });
    },

    authError: (error: string, email?: string, context?: LogContext) => {
      this.error('Authentication error', new Error(error), {
        action: 'auth_error',
        userEmail: email,
        component: 'auth',
        ...context
      });
    },

    adminAction: (action: string, userId?: string, details?: any) => {
      this.info('Admin action performed', {
        action: 'admin_action',
        adminAction: action,
        userId,
        details,
        component: 'admin'
      });
    },

    suspiciousActivity: (activity: string, context?: LogContext) => {
      this.warn('Suspicious activity detected', {
        action: 'suspicious_activity',
        activity,
        component: 'security',
        ...context
      });
    }
  };
}

export const logger = new Logger();
