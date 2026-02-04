"""
Enhanced logger with structured logging capabilities.
"""

import logging
import sys
from typing import Any, Dict, Optional
from datetime import datetime


class EnhancedLogger:
    """Enhanced logger with structured logging."""
    
    def __init__(self, name: str, level: str = "INFO"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(getattr(logging, level.upper()))
        
        # Create console handler if not already present
        if not self.logger.handlers:
            handler = logging.StreamHandler(sys.stdout)
            handler.setLevel(getattr(logging, level.upper()))
            
            # Create formatter
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S'
            )
            handler.setFormatter(formatter)
            
            self.logger.addHandler(handler)
    
    def _log(self, level: str, message: str, **kwargs):
        """Internal log method with context."""
        extra_info = " | ".join(f"{k}={v}" for k, v in kwargs.items() if v is not None)
        full_message = f"{message} | {extra_info}" if extra_info else message
        getattr(self.logger, level)(full_message)
    
    def info(self, message: str, **kwargs):
        """Log info message."""
        self._log("info", message, **kwargs)
    
    def debug(self, message: str, **kwargs):
        """Log debug message."""
        self._log("debug", message, **kwargs)
    
    def warning(self, message: str, **kwargs):
        """Log warning message."""
        self._log("warning", message, **kwargs)
    
    def error(self, message: str, **kwargs):
        """Log error message."""
        self._log("error", message, **kwargs)
    
    def critical(self, message: str, **kwargs):
        """Log critical message."""
        self._log("critical", message, **kwargs)


def create_enhanced_logger(name: str, level: str = "INFO") -> EnhancedLogger:
    """Create and return an enhanced logger instance."""
    return EnhancedLogger(name, level)
