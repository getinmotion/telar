"""
Multi-agent system for artisan business support.

This package contains:
- agents/: Individual specialized agent implementations
- core/: Core orchestration, memory, and state management
- prompts/: System prompts for each agent
- tools/: Tools that agents can use (database, APIs, vector search)
"""

import sys
from pathlib import Path

# Ensure backend directory is in path for imports
backend_path = str(Path(__file__).parent.parent)
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from agents.core.orchestrator import SupervisorAgent, get_supervisor
from agents.core.memory import MemoryService, memory_service
from agents.core.state import AgentState, MemoryEntry, ArtisanProfile

__all__ = [
    'SupervisorAgent',
    'get_supervisor',
    'MemoryService',
    'memory_service',
    'AgentState',
    'MemoryEntry',
    'ArtisanProfile',
]
