"""
DSIRE API Integration Module for IncentEdge

This module provides:
- Connection to the DSIRE (Database of State Incentives for Renewables & Efficiency) API
- Tracking of incentive declaration/discovery dates
- Daily monitoring for new incentives
"""

from .client import DSIREClient
from .tracker import IncentiveTracker
from .scheduler import DailyScheduler

__all__ = ['DSIREClient', 'IncentiveTracker', 'DailyScheduler']
__version__ = '1.0.0'
