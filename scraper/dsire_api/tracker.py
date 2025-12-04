"""
Incentive Tracker Module

Tracks incentive discovery/declaration dates using SQLite database.
Provides functionality to:
- Record when incentives are first seen
- Track changes to incentive details over time
- Identify newly added incentives
- Generate reports on incentive additions/changes
"""

import sqlite3
import json
import hashlib
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any, Tuple
from contextlib import contextmanager

logger = logging.getLogger(__name__)


class IncentiveTracker:
    """
    SQLite-based tracker for incentive discovery and change monitoring.
    """

    DEFAULT_DB_PATH = Path(__file__).parent.parent / 'data' / 'dsire_tracker.db'

    def __init__(self, db_path: Optional[str] = None):
        """
        Initialize the tracker with database connection.

        Args:
            db_path: Path to SQLite database file (default: scraper/data/dsire_tracker.db)
        """
        self.db_path = Path(db_path) if db_path else self.DEFAULT_DB_PATH
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_database()

    @contextmanager
    def _get_connection(self):
        """Context manager for database connections."""
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def _init_database(self):
        """Initialize database schema."""
        with self._get_connection() as conn:
            cursor = conn.cursor()

            # Main incentives tracking table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS incentives (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    dsire_id TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    state TEXT,
                    program_type TEXT,
                    first_seen_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    last_seen_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    last_updated_at TIMESTAMP,
                    data_hash TEXT,
                    is_active BOOLEAN DEFAULT 1,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # Full data snapshots for change tracking
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS incentive_snapshots (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    incentive_id INTEGER NOT NULL,
                    data_json TEXT NOT NULL,
                    data_hash TEXT NOT NULL,
                    scraped_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (incentive_id) REFERENCES incentives(id)
                )
            ''')

            # Track changes between snapshots
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS incentive_changes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    incentive_id INTEGER NOT NULL,
                    field_name TEXT NOT NULL,
                    old_value TEXT,
                    new_value TEXT,
                    detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (incentive_id) REFERENCES incentives(id)
                )
            ''')

            # Daily scan logs
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS scan_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    scan_type TEXT NOT NULL,
                    states_scanned TEXT,
                    total_found INTEGER DEFAULT 0,
                    new_incentives INTEGER DEFAULT 0,
                    updated_incentives INTEGER DEFAULT 0,
                    removed_incentives INTEGER DEFAULT 0,
                    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP,
                    status TEXT DEFAULT 'running',
                    error_message TEXT
                )
            ''')

            # Create indexes for faster queries
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_incentives_dsire_id ON incentives(dsire_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_incentives_state ON incentives(state)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_incentives_first_seen ON incentives(first_seen_at)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_snapshots_incentive ON incentive_snapshots(incentive_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_changes_incentive ON incentive_changes(incentive_id)')

            logger.info(f"Database initialized at {self.db_path}")

    def _compute_hash(self, data: Dict[str, Any]) -> str:
        """Compute a hash of the data for change detection."""
        # Sort keys for consistent hashing
        sorted_data = json.dumps(data, sort_keys=True, default=str)
        return hashlib.md5(sorted_data.encode()).hexdigest()

    def start_scan(self, scan_type: str = 'daily', states: Optional[List[str]] = None) -> int:
        """
        Start a new scan session and return the scan ID.

        Args:
            scan_type: Type of scan (daily, full, targeted)
            states: List of states being scanned

        Returns:
            Scan log ID
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO scan_logs (scan_type, states_scanned, started_at)
                VALUES (?, ?, ?)
            ''', (scan_type, json.dumps(states) if states else None, datetime.now()))
            return cursor.lastrowid

    def end_scan(self, scan_id: int, status: str = 'completed',
                 total_found: int = 0, new_count: int = 0,
                 updated_count: int = 0, removed_count: int = 0,
                 error_message: str = None):
        """
        Mark a scan as complete with results.

        Args:
            scan_id: The scan log ID
            status: Final status (completed, failed)
            total_found: Total incentives found
            new_count: Number of new incentives
            updated_count: Number of updated incentives
            removed_count: Number of removed incentives
            error_message: Error message if failed
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE scan_logs
                SET status = ?, completed_at = ?, total_found = ?,
                    new_incentives = ?, updated_incentives = ?,
                    removed_incentives = ?, error_message = ?
                WHERE id = ?
            ''', (status, datetime.now(), total_found, new_count,
                  updated_count, removed_count, error_message, scan_id))

    def record_incentive(self, dsire_id: str, data: Dict[str, Any]) -> Tuple[bool, bool]:
        """
        Record an incentive, tracking if it's new or updated.

        Args:
            dsire_id: The DSIRE program ID
            data: Full program data dictionary

        Returns:
            Tuple of (is_new, is_updated)
        """
        data_hash = self._compute_hash(data)
        now = datetime.now()

        with self._get_connection() as conn:
            cursor = conn.cursor()

            # Check if incentive exists
            cursor.execute('SELECT id, data_hash FROM incentives WHERE dsire_id = ?', (dsire_id,))
            existing = cursor.fetchone()

            if not existing:
                # New incentive
                cursor.execute('''
                    INSERT INTO incentives (dsire_id, name, state, program_type,
                                          first_seen_at, last_seen_at, data_hash)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    dsire_id,
                    data.get('name', 'Unknown'),
                    data.get('state', ''),
                    data.get('program_type', ''),
                    now, now, data_hash
                ))
                incentive_id = cursor.lastrowid

                # Save initial snapshot
                cursor.execute('''
                    INSERT INTO incentive_snapshots (incentive_id, data_json, data_hash)
                    VALUES (?, ?, ?)
                ''', (incentive_id, json.dumps(data, default=str), data_hash))

                logger.info(f"New incentive recorded: {dsire_id} - {data.get('name', 'Unknown')}")
                return (True, False)

            else:
                incentive_id = existing['id']
                old_hash = existing['data_hash']

                # Update last_seen_at
                cursor.execute('''
                    UPDATE incentives SET last_seen_at = ?, is_active = 1 WHERE id = ?
                ''', (now, incentive_id))

                # Check if data changed
                if old_hash != data_hash:
                    # Record changes
                    cursor.execute('''
                        SELECT data_json FROM incentive_snapshots
                        WHERE incentive_id = ?
                        ORDER BY scraped_at DESC LIMIT 1
                    ''', (incentive_id,))
                    old_snapshot = cursor.fetchone()

                    if old_snapshot:
                        old_data = json.loads(old_snapshot['data_json'])
                        self._record_changes(cursor, incentive_id, old_data, data)

                    # Save new snapshot
                    cursor.execute('''
                        INSERT INTO incentive_snapshots (incentive_id, data_json, data_hash)
                        VALUES (?, ?, ?)
                    ''', (incentive_id, json.dumps(data, default=str), data_hash))

                    # Update hash
                    cursor.execute('''
                        UPDATE incentives SET data_hash = ?, last_updated_at = ? WHERE id = ?
                    ''', (data_hash, now, incentive_id))

                    logger.info(f"Incentive updated: {dsire_id}")
                    return (False, True)

                return (False, False)

    def _record_changes(self, cursor, incentive_id: int,
                        old_data: Dict, new_data: Dict):
        """Record specific field changes between versions."""
        # Fields to track for changes
        tracked_fields = [
            'name', 'program_type', 'incentive_amount', 'start_date',
            'end_date', 'description', 'eligible_sectors', 'technologies',
            'implementing_sector', 'contact', 'website'
        ]

        for field in tracked_fields:
            old_value = str(old_data.get(field, '')) if old_data.get(field) else None
            new_value = str(new_data.get(field, '')) if new_data.get(field) else None

            if old_value != new_value:
                cursor.execute('''
                    INSERT INTO incentive_changes (incentive_id, field_name, old_value, new_value)
                    VALUES (?, ?, ?, ?)
                ''', (incentive_id, field, old_value, new_value))

    def mark_inactive(self, dsire_ids: List[str]):
        """
        Mark incentives as inactive (no longer found in DSIRE).

        Args:
            dsire_ids: List of DSIRE IDs to mark as inactive
        """
        if not dsire_ids:
            return

        with self._get_connection() as conn:
            cursor = conn.cursor()
            placeholders = ','.join('?' * len(dsire_ids))
            cursor.execute(f'''
                UPDATE incentives SET is_active = 0
                WHERE dsire_id IN ({placeholders})
            ''', dsire_ids)
            logger.info(f"Marked {cursor.rowcount} incentives as inactive")

    def get_new_incentives(self, since: datetime = None,
                           days: int = None) -> List[Dict[str, Any]]:
        """
        Get incentives first seen after a certain date.

        Args:
            since: DateTime to filter from (default: 24 hours ago)
            days: Alternative to since - number of days back

        Returns:
            List of new incentive records
        """
        if days is not None:
            since = datetime.now() - timedelta(days=days)
        elif since is None:
            since = datetime.now() - timedelta(days=1)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT i.*, s.data_json
                FROM incentives i
                LEFT JOIN incentive_snapshots s ON s.incentive_id = i.id
                WHERE i.first_seen_at >= ?
                AND s.id = (
                    SELECT MAX(id) FROM incentive_snapshots WHERE incentive_id = i.id
                )
                ORDER BY i.first_seen_at DESC
            ''', (since,))

            results = []
            for row in cursor.fetchall():
                record = dict(row)
                if record.get('data_json'):
                    record['data'] = json.loads(record['data_json'])
                    del record['data_json']
                results.append(record)

            return results

    def get_updated_incentives(self, since: datetime = None,
                               days: int = None) -> List[Dict[str, Any]]:
        """
        Get incentives that were updated after a certain date.

        Args:
            since: DateTime to filter from
            days: Alternative to since - number of days back

        Returns:
            List of updated incentive records with changes
        """
        if days is not None:
            since = datetime.now() - timedelta(days=days)
        elif since is None:
            since = datetime.now() - timedelta(days=1)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT i.*, GROUP_CONCAT(
                    c.field_name || ':' || COALESCE(c.old_value, 'NULL')
                    || '->' || COALESCE(c.new_value, 'NULL'), '; '
                ) as changes
                FROM incentives i
                JOIN incentive_changes c ON c.incentive_id = i.id
                WHERE c.detected_at >= ?
                GROUP BY i.id
                ORDER BY i.last_updated_at DESC
            ''', (since,))

            return [dict(row) for row in cursor.fetchall()]

    def get_incentive_by_dsire_id(self, dsire_id: str) -> Optional[Dict[str, Any]]:
        """
        Get full incentive record by DSIRE ID.

        Args:
            dsire_id: The DSIRE program ID

        Returns:
            Incentive record with latest snapshot or None
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT i.*, s.data_json
                FROM incentives i
                LEFT JOIN incentive_snapshots s ON s.incentive_id = i.id
                WHERE i.dsire_id = ?
                ORDER BY s.scraped_at DESC
                LIMIT 1
            ''', (dsire_id,))

            row = cursor.fetchone()
            if row:
                record = dict(row)
                if record.get('data_json'):
                    record['data'] = json.loads(record['data_json'])
                    del record['data_json']
                return record
            return None

    def get_all_incentives(self, state: str = None,
                           active_only: bool = True) -> List[Dict[str, Any]]:
        """
        Get all tracked incentives.

        Args:
            state: Optional state filter
            active_only: Only return active incentives

        Returns:
            List of incentive records
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()

            query = 'SELECT * FROM incentives WHERE 1=1'
            params = []

            if active_only:
                query += ' AND is_active = 1'
            if state:
                query += ' AND state = ?'
                params.append(state.upper())

            query += ' ORDER BY first_seen_at DESC'

            cursor.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]

    def get_incentive_history(self, dsire_id: str) -> List[Dict[str, Any]]:
        """
        Get change history for a specific incentive.

        Args:
            dsire_id: The DSIRE program ID

        Returns:
            List of change records
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT c.*
                FROM incentive_changes c
                JOIN incentives i ON i.id = c.incentive_id
                WHERE i.dsire_id = ?
                ORDER BY c.detected_at DESC
            ''', (dsire_id,))

            return [dict(row) for row in cursor.fetchall()]

    def get_stats(self) -> Dict[str, Any]:
        """
        Get overall tracker statistics.

        Returns:
            Dictionary of statistics
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()

            stats = {}

            # Total incentives
            cursor.execute('SELECT COUNT(*) FROM incentives')
            stats['total_incentives'] = cursor.fetchone()[0]

            # Active incentives
            cursor.execute('SELECT COUNT(*) FROM incentives WHERE is_active = 1')
            stats['active_incentives'] = cursor.fetchone()[0]

            # By state
            cursor.execute('''
                SELECT state, COUNT(*) as count
                FROM incentives WHERE is_active = 1
                GROUP BY state ORDER BY count DESC
            ''')
            stats['by_state'] = {row['state']: row['count'] for row in cursor.fetchall()}

            # New in last 24 hours
            yesterday = datetime.now() - timedelta(days=1)
            cursor.execute('SELECT COUNT(*) FROM incentives WHERE first_seen_at >= ?', (yesterday,))
            stats['new_last_24h'] = cursor.fetchone()[0]

            # New in last 7 days
            week_ago = datetime.now() - timedelta(days=7)
            cursor.execute('SELECT COUNT(*) FROM incentives WHERE first_seen_at >= ?', (week_ago,))
            stats['new_last_7d'] = cursor.fetchone()[0]

            # Total changes recorded
            cursor.execute('SELECT COUNT(*) FROM incentive_changes')
            stats['total_changes'] = cursor.fetchone()[0]

            # Last scan
            cursor.execute('''
                SELECT * FROM scan_logs ORDER BY started_at DESC LIMIT 1
            ''')
            last_scan = cursor.fetchone()
            if last_scan:
                stats['last_scan'] = dict(last_scan)

            return stats

    def get_scan_history(self, limit: int = 30) -> List[Dict[str, Any]]:
        """
        Get recent scan history.

        Args:
            limit: Maximum number of records to return

        Returns:
            List of scan log records
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM scan_logs
                ORDER BY started_at DESC
                LIMIT ?
            ''', (limit,))

            return [dict(row) for row in cursor.fetchall()]

    def export_to_json(self, filepath: str, active_only: bool = True):
        """
        Export all incentives to a JSON file.

        Args:
            filepath: Output file path
            active_only: Only export active incentives
        """
        incentives = self.get_all_incentives(active_only=active_only)

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump({
                'exported_at': datetime.now().isoformat(),
                'total_count': len(incentives),
                'incentives': incentives
            }, f, indent=2, default=str)

        logger.info(f"Exported {len(incentives)} incentives to {filepath}")

    def export_to_csv(self, filepath: str, active_only: bool = True):
        """
        Export all incentives to a CSV file.

        Args:
            filepath: Output file path
            active_only: Only export active incentives
        """
        import csv

        incentives = self.get_all_incentives(active_only=active_only)

        if not incentives:
            logger.warning("No incentives to export")
            return

        fieldnames = list(incentives[0].keys())

        with open(filepath, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(incentives)

        logger.info(f"Exported {len(incentives)} incentives to {filepath}")


if __name__ == '__main__':
    # Quick test
    logging.basicConfig(level=logging.INFO)
    tracker = IncentiveTracker()

    print("Tracker stats:", tracker.get_stats())
