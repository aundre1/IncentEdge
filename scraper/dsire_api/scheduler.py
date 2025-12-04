"""
Daily Scheduler for DSIRE Incentive Monitoring

Provides automated daily scanning for new incentives with:
- Configurable scan schedules
- State rotation for distributed scanning
- Email/webhook notifications for new incentives
- Retry logic for failed scans
"""

import time
import json
import logging
import threading
import schedule
from datetime import datetime, timedelta
from typing import Optional, List, Callable, Dict, Any
from pathlib import Path

from .client import DSIREClient
from .tracker import IncentiveTracker

logger = logging.getLogger(__name__)


class DailyScheduler:
    """
    Scheduler for automated daily DSIRE incentive monitoring.
    """

    # Default scan schedule - rotate through state groups
    STATE_GROUPS = {
        'northeast': ['CT', 'ME', 'MA', 'NH', 'RI', 'VT', 'NJ', 'NY', 'PA'],
        'southeast': ['DE', 'FL', 'GA', 'MD', 'NC', 'SC', 'VA', 'DC', 'WV'],
        'midwest': ['IL', 'IN', 'MI', 'OH', 'WI', 'IA', 'KS', 'MN', 'MO', 'NE', 'ND', 'SD'],
        'southwest': ['AZ', 'NM', 'OK', 'TX'],
        'west': ['CO', 'ID', 'MT', 'NV', 'UT', 'WY', 'AK', 'CA', 'HI', 'OR', 'WA'],
        'south': ['AL', 'KY', 'MS', 'TN', 'AR', 'LA']
    }

    # Priority states (scanned more frequently)
    PRIORITY_STATES = ['NY', 'CA', 'TX', 'FL', 'PA', 'NJ', 'MA', 'CT']

    def __init__(self,
                 client: Optional[DSIREClient] = None,
                 tracker: Optional[IncentiveTracker] = None,
                 config_path: Optional[str] = None):
        """
        Initialize the scheduler.

        Args:
            client: DSIRE API client instance
            tracker: Incentive tracker instance
            config_path: Path to configuration file
        """
        self.client = client or DSIREClient()
        self.tracker = tracker or IncentiveTracker()
        self.config = self._load_config(config_path)
        self._running = False
        self._thread = None
        self._callbacks: List[Callable] = []
        self._last_scan_date = None

    def _load_config(self, config_path: Optional[str]) -> Dict[str, Any]:
        """Load scheduler configuration."""
        default_config = {
            'scan_time': '03:00',  # 3 AM daily
            'scan_all_states': False,  # If false, rotate through groups
            'priority_scan_frequency': 'daily',  # Priority states scan frequency
            'full_scan_frequency': 'weekly',  # Full scan of all states
            'include_details': False,  # Fetch full program details
            'max_retries': 3,
            'retry_delay': 300,  # 5 minutes
            'notification_webhook': None,
            'notification_email': None
        }

        if config_path and Path(config_path).exists():
            with open(config_path) as f:
                user_config = json.load(f)
                default_config.update(user_config)

        return default_config

    def add_callback(self, callback: Callable[[Dict[str, Any]], None]):
        """
        Add a callback function to be called when new incentives are found.

        Args:
            callback: Function that takes a dict with scan results
        """
        self._callbacks.append(callback)

    def _notify_callbacks(self, results: Dict[str, Any]):
        """Notify all registered callbacks."""
        for callback in self._callbacks:
            try:
                callback(results)
            except Exception as e:
                logger.error(f"Callback error: {e}")

    def _get_states_for_today(self) -> List[str]:
        """
        Determine which states to scan today based on rotation schedule.

        Returns:
            List of state codes to scan
        """
        today = datetime.now()

        # Priority states are always included
        states = list(self.PRIORITY_STATES)

        # Determine which group to scan today based on day of week
        group_names = list(self.STATE_GROUPS.keys())
        day_of_week = today.weekday()  # 0 = Monday

        # Sunday (6) = full scan
        if day_of_week == 6 or self.config.get('scan_all_states'):
            return list(DSIREClient.US_STATES)

        # Rotate through groups on other days
        group_index = day_of_week % len(group_names)
        group_name = group_names[group_index]
        group_states = self.STATE_GROUPS[group_name]

        # Add group states, avoiding duplicates
        for state in group_states:
            if state not in states:
                states.append(state)

        logger.info(f"Today's scan group: {group_name} ({len(states)} states)")
        return states

    def run_scan(self, states: Optional[List[str]] = None,
                 scan_type: str = 'scheduled') -> Dict[str, Any]:
        """
        Run a scan for the specified states.

        Args:
            states: List of state codes (default: today's scheduled states)
            scan_type: Type of scan (scheduled, manual, full)

        Returns:
            Dictionary with scan results
        """
        states = states or self._get_states_for_today()

        logger.info(f"Starting {scan_type} scan for {len(states)} states")

        # Start scan log
        scan_id = self.tracker.start_scan(scan_type, states)

        results = {
            'scan_id': scan_id,
            'scan_type': scan_type,
            'states': states,
            'started_at': datetime.now().isoformat(),
            'new_incentives': [],
            'updated_incentives': [],
            'total_found': 0,
            'errors': []
        }

        try:
            all_found_ids = set()

            # Scan each state
            for idx, state in enumerate(states, 1):
                logger.info(f"Scanning {state} ({idx}/{len(states)})")

                try:
                    programs = self.client.get_programs_by_state(state)

                    for program in programs:
                        dsire_id = str(program.get('id', ''))
                        if not dsire_id:
                            continue

                        all_found_ids.add(dsire_id)

                        # Get full details if configured
                        if self.config.get('include_details'):
                            details = self.client.get_program_details(dsire_id)
                            if details:
                                program.update(details)

                        # Record in tracker
                        is_new, is_updated = self.tracker.record_incentive(dsire_id, program)

                        if is_new:
                            results['new_incentives'].append({
                                'dsire_id': dsire_id,
                                'name': program.get('name', 'Unknown'),
                                'state': state,
                                'program_type': program.get('program_type', ''),
                                'discovered_at': datetime.now().isoformat()
                            })

                        if is_updated:
                            results['updated_incentives'].append({
                                'dsire_id': dsire_id,
                                'name': program.get('name', 'Unknown'),
                                'state': state
                            })

                        results['total_found'] += 1

                except Exception as e:
                    error_msg = f"Error scanning {state}: {str(e)}"
                    logger.error(error_msg)
                    results['errors'].append(error_msg)

            # Complete scan log
            self.tracker.end_scan(
                scan_id,
                status='completed',
                total_found=results['total_found'],
                new_count=len(results['new_incentives']),
                updated_count=len(results['updated_incentives'])
            )

            results['completed_at'] = datetime.now().isoformat()
            results['status'] = 'completed'

            # Notify callbacks
            if results['new_incentives'] or results['updated_incentives']:
                self._notify_callbacks(results)
                self._send_notifications(results)

            logger.info(
                f"Scan completed: {results['total_found']} total, "
                f"{len(results['new_incentives'])} new, "
                f"{len(results['updated_incentives'])} updated"
            )

        except Exception as e:
            error_msg = str(e)
            logger.error(f"Scan failed: {error_msg}")
            self.tracker.end_scan(scan_id, status='failed', error_message=error_msg)
            results['status'] = 'failed'
            results['error'] = error_msg

        return results

    def _send_notifications(self, results: Dict[str, Any]):
        """Send notifications for new/updated incentives."""
        # Webhook notification
        webhook_url = self.config.get('notification_webhook')
        if webhook_url and (results['new_incentives'] or results['updated_incentives']):
            try:
                import requests
                requests.post(webhook_url, json=results, timeout=10)
                logger.info("Webhook notification sent")
            except Exception as e:
                logger.error(f"Webhook notification failed: {e}")

        # Log notification (could be extended to email)
        if results['new_incentives']:
            logger.info(f"NEW INCENTIVES FOUND: {len(results['new_incentives'])}")
            for inc in results['new_incentives'][:5]:  # Log first 5
                logger.info(f"  - {inc['name']} ({inc['state']})")

    def _scheduled_job(self):
        """Job executed by the scheduler."""
        try:
            logger.info("Running scheduled scan...")
            self.run_scan(scan_type='scheduled')
            self._last_scan_date = datetime.now().date()
        except Exception as e:
            logger.error(f"Scheduled scan failed: {e}")

            # Retry logic
            retries = self.config.get('max_retries', 3)
            retry_delay = self.config.get('retry_delay', 300)

            for attempt in range(retries):
                logger.info(f"Retry attempt {attempt + 1}/{retries} in {retry_delay}s")
                time.sleep(retry_delay)
                try:
                    self.run_scan(scan_type='retry')
                    break
                except Exception as retry_e:
                    logger.error(f"Retry {attempt + 1} failed: {retry_e}")

    def start(self, blocking: bool = False):
        """
        Start the scheduler.

        Args:
            blocking: If True, block the current thread
        """
        if self._running:
            logger.warning("Scheduler is already running")
            return

        # Schedule the daily scan
        scan_time = self.config.get('scan_time', '03:00')
        schedule.every().day.at(scan_time).do(self._scheduled_job)

        logger.info(f"Scheduler started. Daily scan at {scan_time}")

        self._running = True

        if blocking:
            self._run_loop()
        else:
            self._thread = threading.Thread(target=self._run_loop, daemon=True)
            self._thread.start()

    def _run_loop(self):
        """Main scheduler loop."""
        while self._running:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

    def stop(self):
        """Stop the scheduler."""
        self._running = False
        schedule.clear()
        if self._thread:
            self._thread.join(timeout=5)
        logger.info("Scheduler stopped")

    def run_now(self, states: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Run an immediate scan.

        Args:
            states: List of states to scan (default: scheduled states)

        Returns:
            Scan results
        """
        return self.run_scan(states=states, scan_type='manual')

    def run_full_scan(self) -> Dict[str, Any]:
        """
        Run a full scan of all states.

        Returns:
            Scan results
        """
        return self.run_scan(states=list(DSIREClient.US_STATES), scan_type='full')

    def get_status(self) -> Dict[str, Any]:
        """
        Get current scheduler status.

        Returns:
            Status dictionary
        """
        next_run = schedule.next_run()

        return {
            'running': self._running,
            'scan_time': self.config.get('scan_time'),
            'next_scan': next_run.isoformat() if next_run else None,
            'last_scan_date': self._last_scan_date.isoformat() if self._last_scan_date else None,
            'tracker_stats': self.tracker.get_stats(),
            'todays_states': self._get_states_for_today()
        }

    def get_new_since_last_scan(self) -> List[Dict[str, Any]]:
        """
        Get incentives discovered since the last scan.

        Returns:
            List of new incentive records
        """
        if self._last_scan_date:
            since = datetime.combine(self._last_scan_date, datetime.min.time())
        else:
            since = datetime.now() - timedelta(days=1)

        return self.tracker.get_new_incentives(since=since)


class ScanRunner:
    """
    Simple runner for one-time scans without scheduling.
    Useful for CLI usage or manual data collection.
    """

    def __init__(self, db_path: Optional[str] = None):
        """
        Initialize the scan runner.

        Args:
            db_path: Path to SQLite database
        """
        self.client = DSIREClient()
        self.tracker = IncentiveTracker(db_path)

    def scan_states(self, states: List[str],
                    include_details: bool = False,
                    progress_callback: Callable = None) -> Dict[str, Any]:
        """
        Scan specific states for incentives.

        Args:
            states: List of state codes
            include_details: Whether to fetch full program details
            progress_callback: Optional callback for progress updates

        Returns:
            Scan results dictionary
        """
        scan_id = self.tracker.start_scan('manual', states)

        results = {
            'scan_id': scan_id,
            'states': states,
            'started_at': datetime.now().isoformat(),
            'new_incentives': [],
            'updated_incentives': [],
            'total_found': 0,
            'errors': []
        }

        for idx, state in enumerate(states, 1):
            if progress_callback:
                progress_callback(f"Scanning {state}", idx, len(states))

            try:
                programs = self.client.get_programs_by_state(state)

                for program in programs:
                    dsire_id = str(program.get('id', ''))
                    if not dsire_id:
                        continue

                    if include_details:
                        details = self.client.get_program_details(dsire_id)
                        if details:
                            program.update(details)

                    is_new, is_updated = self.tracker.record_incentive(dsire_id, program)

                    if is_new:
                        results['new_incentives'].append(program)
                    if is_updated:
                        results['updated_incentives'].append(program)

                    results['total_found'] += 1

            except Exception as e:
                results['errors'].append(f"{state}: {str(e)}")

        self.tracker.end_scan(
            scan_id,
            status='completed',
            total_found=results['total_found'],
            new_count=len(results['new_incentives']),
            updated_count=len(results['updated_incentives'])
        )

        results['completed_at'] = datetime.now().isoformat()
        return results

    def scan_all(self, include_details: bool = False) -> Dict[str, Any]:
        """
        Scan all US states.

        Args:
            include_details: Whether to fetch full program details

        Returns:
            Scan results dictionary
        """
        return self.scan_states(
            list(DSIREClient.US_STATES),
            include_details=include_details
        )

    def get_tracker_stats(self) -> Dict[str, Any]:
        """Get tracker statistics."""
        return self.tracker.get_stats()


if __name__ == '__main__':
    # Quick test
    logging.basicConfig(level=logging.INFO)

    runner = ScanRunner()
    print("Scanning NY...")
    results = runner.scan_states(['NY'])
    print(f"Results: {results['total_found']} found, {len(results['new_incentives'])} new")
