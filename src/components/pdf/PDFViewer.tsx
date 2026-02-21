'use client';

/**
 * PDFViewer Component
 *
 * Client-side component that renders PDF reports in the browser and provides
 * download functionality using @react-pdf/renderer.
 *
 * Features:
 * - In-browser PDF preview (when supported)
 * - Download button for direct PDF generation
 * - Loading state while generating PDF
 * - Error handling for PDF generation failures
 *
 * Note: Uses dynamic imports because @react-pdf/renderer is not SSR compatible.
 */

import React, { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ReportData } from '@/lib/pdf-generator';

// Dynamically import PDF components to avoid SSR issues
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
  { ssr: false }
);

const BlobProvider = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.BlobProvider),
  { ssr: false }
);

// Dynamically import the PDF document component
const IncentiveReportPDF = dynamic(
  () => import('./IncentiveReportPDF').then((mod) => mod.IncentiveReportPDF),
  { ssr: false }
);

export interface PDFViewerComponentProps {
  /**
   * The report data to render in the PDF
   */
  report: ReportData;

  /**
   * Whether to show the inline viewer (default: false)
   * Note: Inline viewer may not work in all browsers
   */
  showViewer?: boolean;

  /**
   * Custom filename for the downloaded PDF
   */
  filename?: string;

  /**
   * Optional CSS class name for the container
   */
  className?: string;

  /**
   * Callback when PDF generation starts
   */
  onGenerating?: () => void;

  /**
   * Callback when PDF generation completes
   */
  onGenerated?: () => void;

  /**
   * Callback when PDF generation fails
   */
  onError?: (error: Error) => void;
}

// Loading spinner component
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// Download icon component
function DownloadIcon() {
  return (
    <svg
      className="h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

// File icon component
function FileIcon() {
  return (
    <svg
      className="h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}

/**
 * PDFViewerComponent - Main component for rendering and downloading PDF reports
 */
export function PDFViewerComponent({
  report,
  showViewer = false,
  filename,
  className = '',
  onGenerating,
  onGenerated,
  onError,
}: PDFViewerComponentProps) {
  const [isClient, setIsClient] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ensure we're on the client side
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Generate filename based on project name and date
  const pdfFilename = useMemo(() => {
    if (filename) return filename;
    const sanitizedName = report.projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const date = new Date().toISOString().split('T')[0];
    return `incentive-report-${sanitizedName}-${date}.pdf`;
  }, [filename, report.projectName]);

  // Handle PDF download manually using blob
  const handleManualDownload = useCallback(async () => {
    if (!isClient) return;

    setIsGenerating(true);
    setError(null);
    onGenerating?.();

    try {
      // Dynamically import pdf renderer
      const { pdf } = await import('@react-pdf/renderer');
      const { IncentiveReportPDF } = await import('./IncentiveReportPDF');

      // Generate the PDF blob
      const doc = <IncentiveReportPDF report={report} />;
      const blob = await pdf(doc).toBlob();

      // Create download link and trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onGenerated?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate PDF';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsGenerating(false);
    }
  }, [isClient, report, pdfFilename, onGenerating, onGenerated, onError]);

  // Don't render anything on server
  if (!isClient) {
    return (
      <div className={`pdf-viewer-container ${className}`}>
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner />
          <span className="ml-2 text-sm text-gray-500">Loading PDF viewer...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`pdf-viewer-container ${className}`}>
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            <span className="font-medium">Error:</span> {error}
          </p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Primary download button */}
        <button
          onClick={handleManualDownload}
          disabled={isGenerating}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <>
              <LoadingSpinner />
              <span className="ml-2">Generating PDF...</span>
            </>
          ) : (
            <>
              <DownloadIcon />
              <span className="ml-2">Download PDF</span>
            </>
          )}
        </button>

        {/* Report info */}
        <div className="flex items-center text-sm text-gray-500">
          <FileIcon />
          <span className="ml-2">{pdfFilename}</span>
        </div>
      </div>

      {/* Report summary */}
      <div className="p-4 bg-gray-50 rounded-md border border-gray-200 mb-4">
        <h3 className="font-semibold text-gray-900 mb-2">{report.projectName}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Location:</span>
            <p className="font-medium">{report.summary.location}</p>
          </div>
          <div>
            <span className="text-gray-500">Total Value:</span>
            <p className="font-medium text-blue-600">
              ${report.incentiveSummary.totalEstimatedValue.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Programs:</span>
            <p className="font-medium">{report.incentiveSummary.incentiveCount}</p>
          </div>
          <div>
            <span className="text-gray-500">Generated:</span>
            <p className="font-medium">
              {new Date(report.generatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Inline PDF Viewer (optional) */}
      {showViewer && (
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">PDF Preview</span>
          </div>
          <div style={{ height: '600px' }}>
            <BlobProvider document={<IncentiveReportPDF report={report} />}>
              {({ blob, url, loading, error: blobError }) => {
                if (loading) {
                  return (
                    <div className="flex items-center justify-center h-full">
                      <LoadingSpinner />
                      <span className="ml-2 text-sm text-gray-500">
                        Generating preview...
                      </span>
                    </div>
                  );
                }

                if (blobError) {
                  return (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-red-600">
                        Failed to generate preview: {blobError.message}
                      </p>
                    </div>
                  );
                }

                if (url) {
                  return (
                    <iframe
                      src={url}
                      title="PDF Preview"
                      style={{ width: '100%', height: '100%', border: 'none' }}
                    />
                  );
                }

                return null;
              }}
            </BlobProvider>
          </div>
        </div>
      )}

      {/* Incentives summary table */}
      {!showViewer && report.incentives.length > 0 && (
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">
              Top Incentives ({Math.min(5, report.incentives.length)} of {report.incentives.length})
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Est. Value
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...report.incentives]
                  .sort((a, b) => b.estimatedValue - a.estimatedValue)
                  .slice(0, 5)
                  .map((incentive) => (
                    <tr key={incentive.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {incentive.name}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500 capitalize">
                        {incentive.category}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        ${incentive.estimatedValue.toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            incentive.confidence === 'high'
                              ? 'bg-green-100 text-green-700'
                              : incentive.confidence === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {incentive.confidence}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default PDFViewerComponent;
