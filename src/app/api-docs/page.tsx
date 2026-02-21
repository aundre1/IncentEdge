'use client';

import { useEffect, useRef } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

/**
 * API Documentation Page
 *
 * Interactive API documentation using Swagger UI.
 * Loads the OpenAPI 3.1 specification from /docs/api/openapi.yaml
 *
 * Features:
 * - Interactive endpoint testing
 * - Request/response examples
 * - Schema definitions
 * - Authentication configuration
 */
export default function ApiDocsPage() {
  const swaggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Custom styles for Swagger UI
    const style = document.createElement('style');
    style.textContent = `
      .swagger-ui .topbar {
        display: none;
      }
      .swagger-ui .info {
        margin: 30px 0;
      }
      .swagger-ui .info .title {
        font-size: 2.5rem;
        font-weight: 700;
        color: #1a202c;
      }
      .swagger-ui .scheme-container {
        background: #f7fafc;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">IncentEdge API Documentation</h1>
              <p className="mt-2 text-lg text-blue-100">
                Infrastructure's Bloomberg Terminal for Incentives
              </p>
            </div>
            <div className="flex gap-4">
              <a
                href="/docs/api/README.md"
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                API Guide
              </a>
              <a
                href="/docs/api/ENDPOINTS.md"
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Quick Reference
              </a>
              <a
                href="/docs/api/openapi.yaml"
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20 transition-colors"
                download
              >
                Download OpenAPI Spec
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="border-b bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 text-sm">
            <span className="font-semibold text-gray-700">Quick Links:</span>
            <a href="#tag/Projects" className="text-blue-600 hover:text-blue-800">
              Projects
            </a>
            <a href="#tag/Programs" className="text-blue-600 hover:text-blue-800">
              Incentive Programs
            </a>
            <a href="#tag/Calculate" className="text-blue-600 hover:text-blue-800">
              Calculate
            </a>
            <a href="#tag/Reports" className="text-blue-600 hover:text-blue-800">
              Reports
            </a>
            <a href="#tag/Dashboard" className="text-blue-600 hover:text-blue-800">
              Dashboard
            </a>
            <a href="#tag/Applications" className="text-blue-600 hover:text-blue-800">
              Applications
            </a>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-3">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">24,458+ Programs</h3>
                <p className="text-sm text-gray-600">Verified incentive programs</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-3">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI-Powered</h3>
                <p className="text-sm text-gray-600">DeepSeek + Claude matching</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-3">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Real-Time Analytics</h3>
                <p className="text-sm text-gray-600">Portfolio tracking & insights</p>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Getting Started</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>
              <strong>Sign up</strong> for an account at{' '}
              <a href="https://incentedge.com/signup" className="underline hover:text-blue-600">
                incentedge.com/signup
              </a>
            </li>
            <li>
              <strong>Generate an API key</strong> from Settings → API Keys
            </li>
            <li>
              <strong>Test the API</strong> using the "Try it out" buttons below or import our{' '}
              <a href="/postman/IncentEdge.postman_collection.json" className="underline hover:text-blue-600" download>
                Postman collection
              </a>
            </li>
            <li>
              <strong>Review the examples</strong> in our{' '}
              <a href="/docs/api/README.md" className="underline hover:text-blue-600" target="_blank" rel="noopener noreferrer">
                API Guide
              </a>
            </li>
          </ol>
        </div>
      </div>

      {/* Swagger UI */}
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8" ref={swaggerRef}>
        <SwaggerUI
          url="/docs/api/openapi.yaml"
          docExpansion="list"
          defaultModelsExpandDepth={1}
          defaultModelExpandDepth={1}
          displayRequestDuration={true}
          filter={true}
          showExtensions={true}
          showCommonExtensions={true}
          tryItOutEnabled={true}
          requestInterceptor={(req) => {
            // Add API key from localStorage if available
            const apiKey = typeof window !== 'undefined' ? localStorage.getItem('incentedge_api_key') : null;
            if (apiKey && !req.headers['X-API-Key']) {
              req.headers['X-API-Key'] = apiKey;
            }
            return req;
          }}
          onComplete={(system) => {
            console.log('Swagger UI loaded successfully');
          }}
        />
      </div>

      {/* Footer */}
      <div className="border-t bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Documentation</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="/docs/api/README.md" className="hover:text-blue-600" target="_blank" rel="noopener noreferrer">
                    API Guide
                  </a>
                </li>
                <li>
                  <a href="/docs/api/ENDPOINTS.md" className="hover:text-blue-600" target="_blank" rel="noopener noreferrer">
                    Endpoint Reference
                  </a>
                </li>
                <li>
                  <a href="/docs/api/openapi.yaml" className="hover:text-blue-600" download>
                    OpenAPI Spec
                  </a>
                </li>
                <li>
                  <a href="/postman/IncentEdge.postman_collection.json" className="hover:text-blue-600" download>
                    Postman Collection
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="mailto:support@incentedge.com" className="hover:text-blue-600">
                    support@incentedge.com
                  </a>
                </li>
                <li>
                  <a href="https://status.incentedge.com" className="hover:text-blue-600" target="_blank" rel="noopener noreferrer">
                    Status Page
                  </a>
                </li>
                <li>
                  <a href="https://github.com/incentedge/api-issues" className="hover:text-blue-600" target="_blank" rel="noopener noreferrer">
                    Report an Issue
                  </a>
                </li>
                <li>
                  <a href="https://help.incentedge.com" className="hover:text-blue-600" target="_blank" rel="noopener noreferrer">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Rate Limits</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Free: 100 req/hour</li>
                <li>Starter: 1,000 req/hour</li>
                <li>Professional: 10,000 req/hour</li>
                <li>Team: 50,000 req/hour</li>
                <li>Enterprise: Custom limits</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            <p>
              IncentEdge API v1.0.0 &copy; {new Date().getFullYear()} IncentEdge. All rights reserved.
            </p>
            <p className="mt-2">
              <a href="https://incentedge.com/terms" className="text-blue-600 hover:text-blue-800">
                Terms of Service
              </a>
              {' • '}
              <a href="https://incentedge.com/privacy" className="text-blue-600 hover:text-blue-800">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
