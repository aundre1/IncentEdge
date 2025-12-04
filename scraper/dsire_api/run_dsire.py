#!/usr/bin/env python3
"""
DSIRE API Incentive Tracker - Main Runner Script

This script provides a command-line interface to:
- Pull all incentives from DSIRE
- Track declaration/discovery dates
- Run daily scans for new incentives
- Generate reports on new/changed incentives

Usage:
    # Scan specific states
    python run_dsire.py scan --states NY,CA,TX

    # Scan all states
    python run_dsire.py scan --all

    # Run as daily daemon
    python run_dsire.py daemon --time 03:00

    # Check for new incentives since last scan
    python run_dsire.py check-new --days 7

    # View tracker statistics
    python run_dsire.py stats

    # Export data
    python run_dsire.py export --format json --output incentives.json
"""

import argparse
import sys
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Optional

# Add parent directories to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from scraper.dsire_api.client import DSIREClient
from scraper.dsire_api.tracker import IncentiveTracker
from scraper.dsire_api.scheduler import DailyScheduler, ScanRunner


# Configure logging
def setup_logging(verbose: bool = False, log_file: Optional[str] = None):
    """Configure logging for the application."""
    level = logging.DEBUG if verbose else logging.INFO

    handlers = [logging.StreamHandler(sys.stdout)]
    if log_file:
        handlers.append(logging.FileHandler(log_file))

    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=handlers
    )


def print_banner():
    """Print application banner."""
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║           DSIRE API Incentive Tracker for IncentEdge         ║
    ║                                                              ║
    ║  Track renewable energy & efficiency incentives from DSIRE   ║
    ╚══════════════════════════════════════════════════════════════╝
    """)


def cmd_scan(args):
    """Execute a scan command."""
    runner = ScanRunner(db_path=args.db)

    if args.all:
        states = list(DSIREClient.US_STATES)
        print(f"Scanning all {len(states)} states and territories...")
    elif args.states:
        states = [s.strip().upper() for s in args.states.split(',')]
        print(f"Scanning {len(states)} states: {', '.join(states)}")
    else:
        # Default to Northeast states (priority for IncentEdge)
        states = ['NY', 'NJ', 'CT', 'MA', 'PA', 'RI', 'VT', 'NH', 'ME']
        print(f"Scanning Northeast states: {', '.join(states)}")

    def progress(msg, current, total):
        print(f"  [{current}/{total}] {msg}")

    results = runner.scan_states(
        states,
        include_details=args.details,
        progress_callback=progress
    )

    # Print summary
    print("\n" + "=" * 60)
    print("SCAN RESULTS")
    print("=" * 60)
    print(f"Total programs found: {results['total_found']}")
    print(f"New incentives:       {len(results['new_incentives'])}")
    print(f"Updated incentives:   {len(results['updated_incentives'])}")

    if results['errors']:
        print(f"Errors:               {len(results['errors'])}")
        for err in results['errors'][:5]:
            print(f"  - {err}")

    if results['new_incentives']:
        print("\nNEW INCENTIVES DISCOVERED:")
        print("-" * 40)
        for inc in results['new_incentives'][:10]:
            name = inc.get('name', 'Unknown')[:50]
            state = inc.get('state', '??')
            print(f"  [{state}] {name}")
        if len(results['new_incentives']) > 10:
            print(f"  ... and {len(results['new_incentives']) - 10} more")

    # Save results if output specified
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        print(f"\nResults saved to: {args.output}")


def cmd_daemon(args):
    """Run as a background daemon with scheduled scans."""
    print(f"Starting DSIRE tracker daemon...")
    print(f"Daily scan scheduled at: {args.time}")
    print("Press Ctrl+C to stop\n")

    scheduler = DailyScheduler()

    # Override scan time
    scheduler.config['scan_time'] = args.time
    scheduler.config['include_details'] = args.details

    # Add callback to log new incentives
    def on_new_incentives(results):
        if results['new_incentives']:
            print(f"\n[{datetime.now()}] NEW INCENTIVES FOUND: {len(results['new_incentives'])}")
            for inc in results['new_incentives'][:5]:
                print(f"  - {inc['name']} ({inc['state']})")

    scheduler.add_callback(on_new_incentives)

    try:
        scheduler.start(blocking=True)
    except KeyboardInterrupt:
        print("\nShutting down...")
        scheduler.stop()


def cmd_check_new(args):
    """Check for new incentives since a date or within days."""
    tracker = IncentiveTracker(db_path=args.db)

    if args.since:
        since = datetime.fromisoformat(args.since)
        new_incentives = tracker.get_new_incentives(since=since)
        updated_incentives = tracker.get_updated_incentives(since=since)
    else:
        days = args.days or 1
        new_incentives = tracker.get_new_incentives(days=days)
        updated_incentives = tracker.get_updated_incentives(days=days)

    print(f"\n{'=' * 60}")
    print(f"INCENTIVE CHANGES (last {args.days or 1} day(s))")
    print(f"{'=' * 60}")

    print(f"\nNEW INCENTIVES: {len(new_incentives)}")
    print("-" * 40)
    if new_incentives:
        for inc in new_incentives:
            print(f"  [{inc.get('state', '??')}] {inc.get('name', 'Unknown')}")
            print(f"       First seen: {inc.get('first_seen_at', 'Unknown')}")
            print(f"       Type: {inc.get('program_type', 'N/A')}")
            print()
    else:
        print("  No new incentives found")

    print(f"\nUPDATED INCENTIVES: {len(updated_incentives)}")
    print("-" * 40)
    if updated_incentives:
        for inc in updated_incentives:
            print(f"  [{inc.get('state', '??')}] {inc.get('name', 'Unknown')}")
            if inc.get('changes'):
                print(f"       Changes: {inc['changes']}")
            print()
    else:
        print("  No updated incentives found")


def cmd_stats(args):
    """Display tracker statistics."""
    tracker = IncentiveTracker(db_path=args.db)
    stats = tracker.get_stats()

    print(f"\n{'=' * 60}")
    print("DSIRE TRACKER STATISTICS")
    print(f"{'=' * 60}")

    print(f"\nTotal incentives tracked:  {stats.get('total_incentives', 0)}")
    print(f"Active incentives:         {stats.get('active_incentives', 0)}")
    print(f"New in last 24 hours:      {stats.get('new_last_24h', 0)}")
    print(f"New in last 7 days:        {stats.get('new_last_7d', 0)}")
    print(f"Total changes recorded:    {stats.get('total_changes', 0)}")

    if stats.get('by_state'):
        print(f"\nTOP STATES BY INCENTIVE COUNT:")
        print("-" * 40)
        top_states = sorted(stats['by_state'].items(), key=lambda x: x[1], reverse=True)[:10]
        for state, count in top_states:
            bar = '#' * min(count // 5, 30)
            print(f"  {state}: {count:4d} {bar}")

    if stats.get('last_scan'):
        scan = stats['last_scan']
        print(f"\nLAST SCAN:")
        print("-" * 40)
        print(f"  Type: {scan.get('scan_type', 'Unknown')}")
        print(f"  Status: {scan.get('status', 'Unknown')}")
        print(f"  Started: {scan.get('started_at', 'Unknown')}")
        print(f"  Found: {scan.get('total_found', 0)} total")
        print(f"  New: {scan.get('new_incentives', 0)}")
        print(f"  Updated: {scan.get('updated_incentives', 0)}")


def cmd_export(args):
    """Export tracked incentives to file."""
    tracker = IncentiveTracker(db_path=args.db)

    output = args.output or f"dsire_incentives_{datetime.now().strftime('%Y%m%d')}"

    if args.format == 'json':
        output_path = output if output.endswith('.json') else f"{output}.json"
        tracker.export_to_json(output_path, active_only=not args.include_inactive)
        print(f"Exported to: {output_path}")

    elif args.format == 'csv':
        output_path = output if output.endswith('.csv') else f"{output}.csv"
        tracker.export_to_csv(output_path, active_only=not args.include_inactive)
        print(f"Exported to: {output_path}")


def cmd_history(args):
    """Show change history for a specific incentive."""
    tracker = IncentiveTracker(db_path=args.db)

    if args.dsire_id:
        incentive = tracker.get_incentive_by_dsire_id(args.dsire_id)
        if not incentive:
            print(f"Incentive not found: {args.dsire_id}")
            return

        print(f"\n{'=' * 60}")
        print(f"INCENTIVE: {incentive.get('name', 'Unknown')}")
        print(f"{'=' * 60}")
        print(f"DSIRE ID:    {incentive.get('dsire_id')}")
        print(f"State:       {incentive.get('state')}")
        print(f"Type:        {incentive.get('program_type')}")
        print(f"First seen:  {incentive.get('first_seen_at')}")
        print(f"Last seen:   {incentive.get('last_seen_at')}")
        print(f"Active:      {'Yes' if incentive.get('is_active') else 'No'}")

        history = tracker.get_incentive_history(args.dsire_id)
        if history:
            print(f"\nCHANGE HISTORY:")
            print("-" * 40)
            for change in history:
                print(f"  [{change.get('detected_at')}] {change.get('field_name')}")
                print(f"    Was: {change.get('old_value', 'N/A')}")
                print(f"    Now: {change.get('new_value', 'N/A')}")
        else:
            print("\nNo changes recorded")

    else:
        # Show recent scan history
        scan_history = tracker.get_scan_history(limit=args.limit or 10)
        print(f"\n{'=' * 60}")
        print("RECENT SCAN HISTORY")
        print(f"{'=' * 60}")

        for scan in scan_history:
            print(f"\n[{scan.get('started_at')}] {scan.get('scan_type').upper()} scan")
            print(f"  Status: {scan.get('status')}")
            print(f"  Found: {scan.get('total_found', 0)} | New: {scan.get('new_incentives', 0)} | Updated: {scan.get('updated_incentives', 0)}")
            if scan.get('error_message'):
                print(f"  Error: {scan.get('error_message')}")


def cmd_api_status(args):
    """Check DSIRE API status."""
    client = DSIREClient()
    status = client.check_api_status()

    print(f"\n{'=' * 60}")
    print("DSIRE API STATUS")
    print(f"{'=' * 60}")
    print(f"API Available:     {'Yes' if status.get('api_available') else 'No'}")
    print(f"Website Available: {'Yes' if status.get('website_available') else 'No'}")
    print(f"Timestamp:         {status.get('timestamp')}")

    if status.get('errors'):
        print(f"\nErrors:")
        for err in status['errors']:
            print(f"  - {err}")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='DSIRE API Incentive Tracker for IncentEdge',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s scan --states NY,CA,TX      # Scan specific states
  %(prog)s scan --all                  # Scan all states
  %(prog)s daemon --time 03:00         # Run as daemon with daily scans
  %(prog)s check-new --days 7          # Check new incentives in last 7 days
  %(prog)s stats                       # View tracker statistics
  %(prog)s export --format csv         # Export to CSV
        """
    )

    parser.add_argument('-v', '--verbose', action='store_true', help='Verbose output')
    parser.add_argument('--log-file', help='Log file path')
    parser.add_argument('--db', help='Database path', default=None)

    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    # Scan command
    scan_parser = subparsers.add_parser('scan', help='Scan for incentives')
    scan_parser.add_argument('--states', help='Comma-separated state codes (e.g., NY,CA,TX)')
    scan_parser.add_argument('--all', action='store_true', help='Scan all states')
    scan_parser.add_argument('--details', action='store_true', help='Fetch full program details')
    scan_parser.add_argument('--output', '-o', help='Output file for results')

    # Daemon command
    daemon_parser = subparsers.add_parser('daemon', help='Run as background daemon')
    daemon_parser.add_argument('--time', default='03:00', help='Daily scan time (HH:MM)')
    daemon_parser.add_argument('--details', action='store_true', help='Fetch full program details')

    # Check new command
    check_parser = subparsers.add_parser('check-new', help='Check for new incentives')
    check_parser.add_argument('--days', type=int, default=1, help='Number of days to look back')
    check_parser.add_argument('--since', help='ISO date to check from (e.g., 2024-01-01)')

    # Stats command
    subparsers.add_parser('stats', help='Display tracker statistics')

    # Export command
    export_parser = subparsers.add_parser('export', help='Export tracked incentives')
    export_parser.add_argument('--format', choices=['json', 'csv'], default='json', help='Output format')
    export_parser.add_argument('--output', '-o', help='Output file path')
    export_parser.add_argument('--include-inactive', action='store_true', help='Include inactive incentives')

    # History command
    history_parser = subparsers.add_parser('history', help='View incentive or scan history')
    history_parser.add_argument('--dsire-id', help='DSIRE program ID for incentive history')
    history_parser.add_argument('--limit', type=int, help='Limit number of records')

    # API status command
    subparsers.add_parser('api-status', help='Check DSIRE API status')

    args = parser.parse_args()

    if not args.command:
        print_banner()
        parser.print_help()
        return

    setup_logging(args.verbose, args.log_file)
    print_banner()

    # Route to command handler
    commands = {
        'scan': cmd_scan,
        'daemon': cmd_daemon,
        'check-new': cmd_check_new,
        'stats': cmd_stats,
        'export': cmd_export,
        'history': cmd_history,
        'api-status': cmd_api_status
    }

    handler = commands.get(args.command)
    if handler:
        handler(args)
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
