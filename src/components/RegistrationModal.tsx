'use client';

import React, { useState, useCallback } from 'react';
import { X, AlertCircle, CheckCircle, Loader } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (leadId: string) => void;
  projectAddress?: string; // Pre-filled from sample search
}

interface FormData {
  email: string;
  companySize: string;
  industry: string;
  projectAddress: string;
  projectType: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

// ============================================================================
// CONSTANTS
// ============================================================================

const COMPANY_SIZES = ['1-10', '11-50', '50-200', '200+'];
const INDUSTRIES = [
  'Real Estate',
  'Clean Energy',
  'Utilities',
  'Manufacturing',
  'Technology',
  'Healthcare',
  'Education',
  'Other',
];
const PROJECT_TYPES = [
  'Commercial',
  'Residential',
  'Mixed-Use',
  'Solar',
  'Wind',
  'Storage',
  'Other',
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function RegistrationModal({
  isOpen,
  onClose,
  onSuccess,
  projectAddress = '',
}: RegistrationModalProps) {
  // ========================================================================
  // STATE
  // ========================================================================

  const [formData, setFormData] = useState<FormData>({
    email: '',
    companySize: '',
    industry: '',
    projectAddress: projectAddress,
    projectType: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  // ========================================================================
  // VALIDATION
  // ========================================================================

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Project address validation
    if (!formData.projectAddress.trim()) {
      newErrors.projectAddress = 'Project address is required';
    } else if (formData.projectAddress.length < 5) {
      newErrors.projectAddress = 'Please enter a complete address';
    }

    // Project type validation
    if (!formData.projectType) {
      newErrors.projectType = 'Project type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    },
    [errors]
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          company_size: formData.companySize || undefined,
          industry: formData.industry || undefined,
          project_address: formData.projectAddress.trim(),
          project_type: formData.projectType,
          utm_source: 'homepage',
          utm_campaign: 'free_sample',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setSubmitStatus('error');

        if (result.error === 'Monthly report limit reached') {
          setSubmitMessage(
            `You can generate another report in ${result.details?.daysUntilNext || 'several'} days.`
          );
        } else if (result.error === 'Too many submissions from this IP') {
          setSubmitMessage(
            'Too many submissions. Please try again in a few minutes.'
          );
        } else {
          setSubmitMessage(result.error || 'Failed to submit form. Please try again.');
        }
        return;
      }

      setSubmitStatus('success');
      setSubmitMessage('Thank you! Check your email for your personalized report.');
      setDownloadUrl(result.report?.url || '');

      // Reset form
      setFormData({
        email: '',
        companySize: '',
        industry: '',
        projectAddress: projectAddress,
        projectType: '',
      });

      // Call success callback
      if (onSuccess && result.lead?.id) {
        onSuccess(result.lead.id);
      }

      // Close modal after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setSubmitMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close dialog"
            disabled={isLoading}
          >
            <X size={24} />
          </button>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="mb-6">
              <h2 id="modal-title" className="text-2xl font-bold text-gray-900">
                Get Your Free Report
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Download your personalized incentive analysis in 30 seconds
              </p>
            </div>

            {/* Success State */}
            {submitStatus === 'success' && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4 mb-6">
                <div className="flex gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                  <div>
                    <h3 className="font-semibold text-green-900 text-sm">
                      Report Request Submitted
                    </h3>
                    <p className="text-green-800 text-sm mt-1">{submitMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {submitStatus === 'error' && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
                <div className="flex gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                  <div>
                    <h3 className="font-semibold text-red-900 text-sm">
                      Unable to Submit
                    </h3>
                    <p className="text-red-800 text-sm mt-1">{submitMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            {submitStatus !== 'success' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="you@company.com"
                    disabled={isLoading}
                    className={`w-full px-3 py-2 border rounded-lg font-medium text-gray-900 placeholder-gray-400 transition-colors ${
                      errors.email
                        ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500'
                        : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Project Address */}
                <div>
                  <label
                    htmlFor="projectAddress"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Project Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="projectAddress"
                    value={formData.projectAddress}
                    onChange={(e) => handleInputChange('projectAddress', e.target.value)}
                    placeholder="123 Main St, City, State, ZIP"
                    disabled={isLoading}
                    className={`w-full px-3 py-2 border rounded-lg font-medium text-gray-900 placeholder-gray-400 transition-colors ${
                      errors.projectAddress
                        ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500'
                        : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  />
                  {errors.projectAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.projectAddress}</p>
                  )}
                </div>

                {/* Project Type */}
                <div>
                  <label
                    htmlFor="projectType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Project Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="projectType"
                    value={formData.projectType}
                    onChange={(e) => handleInputChange('projectType', e.target.value)}
                    disabled={isLoading}
                    className={`w-full px-3 py-2 border rounded-lg font-medium text-gray-900 transition-colors ${
                      errors.projectType
                        ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500'
                        : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  >
                    <option value="">Select project type...</option>
                    {PROJECT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.projectType && (
                    <p className="mt-1 text-sm text-red-600">{errors.projectType}</p>
                  )}
                </div>

                {/* Company Size */}
                <div>
                  <label
                    htmlFor="companySize"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Company Size <span className="text-gray-400">(optional)</span>
                  </label>
                  <select
                    id="companySize"
                    value={formData.companySize}
                    onChange={(e) => handleInputChange('companySize', e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select company size...</option>
                    {COMPANY_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size} employees
                      </option>
                    ))}
                  </select>
                </div>

                {/* Industry */}
                <div>
                  <label
                    htmlFor="industry"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Industry <span className="text-gray-400">(optional)</span>
                  </label>
                  <select
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Privacy Notice */}
                <p className="text-xs text-gray-500 mt-4 px-2">
                  We respect your privacy. Your information will only be used to generate
                  your personalized report and send follow-up information about IncentEdge.
                </p>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      <span>Generating Report...</span>
                    </>
                  ) : (
                    <>
                      <span>Download Free Report</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
