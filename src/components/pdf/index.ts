/**
 * PDF Components Barrel Export
 *
 * Client-side PDF generation components for IncentEdge.
 * Uses @react-pdf/renderer for browser-based PDF generation.
 *
 * Usage:
 * ```tsx
 * import { PDFViewerComponent, IncentiveReportPDF } from '@/components/pdf';
 *
 * // Use PDFViewerComponent for interactive PDF viewing/downloading
 * <PDFViewerComponent report={reportData} />
 *
 * // Use IncentiveReportPDF directly with @react-pdf/renderer utilities
 * import { pdf } from '@react-pdf/renderer';
 * const blob = await pdf(<IncentiveReportPDF report={reportData} />).toBlob();
 * ```
 */

export { IncentiveReportPDF } from './IncentiveReportPDF';
export type { IncentiveReportPDFProps } from './IncentiveReportPDF';

export { PDFViewerComponent } from './PDFViewer';
export type { PDFViewerComponentProps } from './PDFViewer';

// Re-export the default as named export for convenience
export { default as PDFViewer } from './PDFViewer';
