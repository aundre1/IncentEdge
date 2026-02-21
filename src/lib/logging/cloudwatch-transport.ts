/**
 * CloudWatch Transport
 * AWS CloudWatch Logs transport for Winston
 *
 * Note: This requires winston-cloudwatch package
 * Install with: pnpm add winston-cloudwatch
 */

import * as winston from 'winston';

/**
 * CloudWatch configuration interface
 */
export interface CloudWatchConfig {
  logGroupName: string;
  logStreamName?: string;
  awsRegion: string;
  awsAccessKeyId?: string;
  awsSecretKey?: string;
  retentionInDays?: number;
}

/**
 * Create CloudWatch transport
 *
 * Note: This is a placeholder implementation. To enable CloudWatch logging:
 * 1. Install winston-cloudwatch: pnpm add winston-cloudwatch
 * 2. Uncomment the implementation below
 * 3. Set environment variables: CLOUDWATCH_ENABLED=true
 */
export const createCloudWatchTransport = (
  config: CloudWatchConfig
): winston.transport | null => {
  // Check if CloudWatch is enabled
  if (process.env.CLOUDWATCH_ENABLED !== 'true') {
    return null;
  }

  try {
    // Placeholder: Uncomment when winston-cloudwatch is installed
    /*
    const WinstonCloudWatch = require('winston-cloudwatch');

    return new WinstonCloudWatch({
      logGroupName: config.logGroupName,
      logStreamName: config.logStreamName || `${process.env.NODE_ENV}-${new Date().toISOString().split('T')[0]}`,
      awsRegion: config.awsRegion,
      awsAccessKeyId: config.awsAccessKeyId,
      awsSecretKey: config.awsSecretKey,
      retentionInDays: config.retentionInDays || 2555, // 7 years
      messageFormatter: ({ level, message, ...meta }: any) => {
        return JSON.stringify({
          level,
          message,
          ...meta,
          timestamp: new Date().toISOString()
        });
      }
    });
    */

    // For now, log that CloudWatch is not configured
    console.warn('CloudWatch transport is enabled but winston-cloudwatch is not installed');
    return null;
  } catch (error) {
    console.error('Failed to create CloudWatch transport:', error);
    return null;
  }
};

/**
 * CloudWatch log group configuration
 */
export const CLOUDWATCH_LOG_GROUPS = {
  production: '/incentedge/production',
  staging: '/incentedge/staging',
  development: '/incentedge/development'
} as const;

/**
 * Get CloudWatch log group for current environment
 */
export const getCloudWatchLogGroup = (): string => {
  const env = process.env.NODE_ENV || 'development';
  return process.env.CLOUDWATCH_LOG_GROUP ||
         CLOUDWATCH_LOG_GROUPS[env as keyof typeof CLOUDWATCH_LOG_GROUPS] ||
         CLOUDWATCH_LOG_GROUPS.development;
};

/**
 * CloudWatch metric extraction
 * Extract custom metrics from logs for CloudWatch alarms
 */
export interface CloudWatchMetric {
  metricName: string;
  value: number;
  unit: string;
  dimensions?: Record<string, string>;
}

/**
 * Extract metrics from log entry
 */
export const extractMetrics = (logEntry: any): CloudWatchMetric[] => {
  const metrics: CloudWatchMetric[] = [];

  // Extract duration metrics
  if (logEntry.duration !== undefined) {
    metrics.push({
      metricName: 'RequestDuration',
      value: logEntry.duration,
      unit: 'Milliseconds',
      dimensions: {
        Method: logEntry.method || 'UNKNOWN',
        Path: logEntry.path || 'UNKNOWN'
      }
    });
  }

  // Extract error metrics
  if (logEntry.level === 'error') {
    metrics.push({
      metricName: 'ErrorCount',
      value: 1,
      unit: 'Count',
      dimensions: {
        ErrorType: logEntry.errorType || 'UnknownError'
      }
    });
  }

  // Extract status code metrics
  if (logEntry.statusCode !== undefined) {
    metrics.push({
      metricName: 'StatusCode',
      value: logEntry.statusCode,
      unit: 'None',
      dimensions: {
        StatusCode: String(logEntry.statusCode)
      }
    });
  }

  return metrics;
};

/**
 * CloudWatch alarm configuration
 */
export interface CloudWatchAlarmConfig {
  alarmName: string;
  metricName: string;
  threshold: number;
  evaluationPeriods: number;
  comparisonOperator: 'GreaterThanThreshold' | 'LessThanThreshold';
  alarmDescription?: string;
}

/**
 * Recommended CloudWatch alarms
 */
export const RECOMMENDED_ALARMS: CloudWatchAlarmConfig[] = [
  {
    alarmName: 'HighErrorRate',
    metricName: 'ErrorCount',
    threshold: 10,
    evaluationPeriods: 1,
    comparisonOperator: 'GreaterThanThreshold',
    alarmDescription: 'Alert when error count exceeds 10 in 5 minutes'
  },
  {
    alarmName: 'SlowRequests',
    metricName: 'RequestDuration',
    threshold: 5000,
    evaluationPeriods: 2,
    comparisonOperator: 'GreaterThanThreshold',
    alarmDescription: 'Alert when request duration exceeds 5 seconds'
  },
  {
    alarmName: 'High5xxErrors',
    metricName: 'StatusCode',
    threshold: 5,
    evaluationPeriods: 1,
    comparisonOperator: 'GreaterThanThreshold',
    alarmDescription: 'Alert when 5xx errors exceed 5 in 5 minutes'
  }
];

export default createCloudWatchTransport;
