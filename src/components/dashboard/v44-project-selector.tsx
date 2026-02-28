'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { formatCompactCurrency } from '@/lib/utils';
import { projectData, allIncentives, type ProjectInfo } from '@/data/incentives';
import { Plus, Building2, ChevronDown, ChevronUp, Pencil, Camera, Grid3X3, ImageIcon, List as ListIcon } from 'lucide-react';

interface V44ProjectSelectorProps {
  currentProject: string;
  onSelect: (project: string) => void;
}

// Number of project cards per row before "show all" kicks in
const CARDS_PER_ROW = 10;

// ─── Dummy Image Generator (before real Street View) ──────────────────────────

function getDummyImageForPropertyType(type: string): string {
  // Return a placeholder SVG-based data URL with property type styling
  const typeColors: Record<string, { bg: string; text: string }> = {
    'mixed-use': { bg: '#1e3a8a', text: '#60a5fa' },
    'multifamily': { bg: '#1e3a8a', text: '#7dd3fc' },
    'affordable-housing': { bg: '#0c4a2e', text: '#6ee7b7' },
    'transit-oriented': { bg: '#1e3a8a', text: '#60a5fa' },
    'industrial': { bg: '#27190a', text: '#d97706' },
    'office': { bg: '#1e3a8a', text: '#60a5fa' },
    'retail': { bg: '#4c1d95', text: '#d8b4fe' },
    'hotel': { bg: '#7c2d12', text: '#fb923c' },
    'healthcare': { bg: '#0c4a2e', text: '#10b981' },
    'solar': { bg: '#713f12', text: '#fbbf24' },
    'warehouse': { bg: '#27190a', text: '#d97706' },
    'data center': { bg: '#1e1b4b', text: '#818cf8' },
  };

  const colors = typeColors[type.toLowerCase()] || typeColors['industrial'];
  const svgData = `<svg width="640" height="360" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
        <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="640" height="360" fill="url(#grad)"/>
    <rect x="0" y="0" width="640" height="360" fill="${colors.bg}" opacity="0.5"/>
    <circle cx="320" cy="180" r="60" fill="none" stroke="${colors.text}" stroke-width="2" opacity="0.3"/>
    <circle cx="320" cy="180" r="45" fill="none" stroke="${colors.text}" stroke-width="2" opacity="0.4"/>
    <circle cx="320" cy="180" r="30" fill="none" stroke="${colors.text}" stroke-width="2" opacity="0.5"/>
    <text x="320" y="185" font-family="monospace" font-size="14" fill="${colors.text}" text-anchor="middle" opacity="0.7">${type}</text>
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(svgData)}`;
}

// ─── Street View Image URL Builder ────────────────────────────────────────────

function getStreetViewImageUrl(address: string): string | null {
  const apiKey =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      : undefined;
  if (!apiKey) return null;
  const encoded = encodeURIComponent(address);
  return `https://maps.googleapis.com/maps/api/streetview?size=640x360&location=${encoded}&key=${apiKey}&pitch=-5`;
}

// ─── Sector Metrics Mapping ──────────────────────────────────────────────────

interface SectorMetrics {
  primary: { label: string; value: string | number | null };
  secondary: { label: string; value: string | number | null };
}

function getSectorMetrics(projectType: string, data: any): SectorMetrics {
  const sectorMetrics: Record<string, (d: any) => SectorMetrics> = {
    'multifamily': (d) => ({
      primary: { label: 'Units', value: d.units || null },
      secondary: { label: 'Sq Ft', value: d.sqft ? `${(d.sqft / 1000).toFixed(0)}K` : null },
    }),
    'affordable-housing': (d) => ({
      primary: { label: 'Units', value: d.units || null },
      secondary: { label: 'Affordable', value: d.affordableUnits || null },
    }),
    'mixed-use': (d) => ({
      primary: { label: 'Units', value: d.units || null },
      secondary: { label: 'Sq Ft', value: d.sqft ? `${(d.sqft / 1000).toFixed(0)}K` : null },
    }),
    'industrial': (d) => ({
      primary: { label: 'Sq Ft', value: d.sqft ? `${(d.sqft / 1000).toFixed(0)}K` : null },
      secondary: { label: 'Clear Ht', value: d.clearHeight ? `${d.clearHeight}'` : null },
    }),
    'office': (d) => ({
      primary: { label: 'Sq Ft', value: d.sqft ? `${(d.sqft / 1000).toFixed(0)}K` : null },
      secondary: { label: 'Floors', value: d.floors || null },
    }),
    'retail': (d) => ({
      primary: { label: 'Sq Ft', value: d.sqft ? `${(d.sqft / 1000).toFixed(0)}K` : null },
      secondary: { label: 'Tenants', value: d.tenantCount || null },
    }),
    'commercial': (d) => ({
      primary: { label: 'Sq Ft', value: d.sqft ? `${(d.sqft / 1000).toFixed(0)}K` : null },
      secondary: { label: 'Tenants', value: d.tenantCount || null },
    }),
    'hotel': (d) => ({
      primary: { label: 'Rooms', value: d.rooms || null },
      secondary: { label: 'Sq Ft', value: d.sqft ? `${(d.sqft / 1000).toFixed(0)}K` : null },
    }),
    'healthcare': (d) => ({
      primary: { label: 'Beds', value: d.beds || null },
      secondary: { label: 'Sq Ft', value: d.sqft ? `${(d.sqft / 1000).toFixed(0)}K` : null },
    }),
    'solar': (d) => ({
      primary: { label: 'Capacity', value: d.mwCapacity ? `${d.mwCapacity}MW` : null },
      secondary: { label: 'Annual', value: d.annualMwh ? `${d.annualMwh}MWh` : null },
    }),
    'transit-oriented': (d) => ({
      primary: { label: 'Units', value: d.units || null },
      secondary: { label: 'Sq Ft', value: d.sqft ? `${(d.sqft / 1000).toFixed(0)}K` : null },
    }),
  };

  const metricsFn = sectorMetrics[projectType.toLowerCase()] ||
    ((d) => ({
      primary: { label: 'Units', value: d.units || null },
      secondary: { label: 'Sq Ft', value: d.sqft ? `${(d.sqft / 1000).toFixed(0)}K` : null },
    }));

  return metricsFn(data);
}

// ─── localStorage helpers ────────────────────────────────────────────────────

function loadCustomImage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(`incentedge_project_img_${key}`);
  } catch {
    return null;
  }
}

function saveCustomImage(key: string, dataUrl: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`incentedge_project_img_${key}`, dataUrl);
  } catch {
    // localStorage quota exceeded — silently fail
  }
}

// ─── GradientPlaceholder ─────────────────────────────────────────────────────
// Shown when no API key and no custom image.

interface GradientPlaceholderProps {
  name: string;
  type: string;
  isActive: boolean;
}

function GradientPlaceholder({ name, type, isActive }: GradientPlaceholderProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 flex flex-col items-center justify-center gap-2',
        'bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900'
      )}
    >
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(20,184,166,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <Building2
        className={cn(
          'relative z-10 h-8 w-8',
          isActive ? 'text-teal-300' : 'text-teal-400/70'
        )}
      />
      <span className="relative z-10 text-[10px] font-mono text-teal-300/60 px-2 text-center leading-tight">
        {type}
      </span>
    </div>
  );
}

// ─── PortfolioGradient ───────────────────────────────────────────────────────
// Special card for the "All Projects / Portfolio" card.

interface PortfolioGradientProps {
  isActive: boolean;
  projectCount: number;
}

function PortfolioGradient({ isActive, projectCount }: PortfolioGradientProps) {
  // Build a tiny 2×N grid of mini building thumbnails
  const keys = Object.keys(projectData).slice(0, 6);

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-deep-900 to-slate-800 overflow-hidden">
      {/* Decorative dots pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(20,184,166,0.5) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* Mini building grid overlay */}
      <div className="absolute inset-0 flex items-center justify-center p-3">
        <div className="grid grid-cols-3 gap-1 opacity-30">
          {keys.map((k) => (
            <div
              key={k}
              className="h-6 w-7 rounded-sm bg-gradient-to-b from-teal-600/60 to-slate-700/60 flex items-end justify-center pb-0.5"
            >
              <div className="h-3 w-4 bg-teal-500/40 rounded-sm" />
            </div>
          ))}
        </div>
      </div>

      <Grid3X3
        className={cn(
          'absolute top-3 right-3 h-4 w-4',
          isActive ? 'text-teal-300' : 'text-teal-400/40'
        )}
      />
    </div>
  );
}

// ─── ProjectCard16x9 ─────────────────────────────────────────────────────────

interface ProjectCard16x9Props {
  projectKey: string;
  project: ProjectInfo;
  isActive: boolean;
  incentiveCount: number;
  onSelect: (key: string) => void;
  customImage: string | null;
  onCustomImageChange: (key: string, dataUrl: string) => void;
  viewMode: 'image' | 'text';
}

function ProjectCard16x9({
  projectKey,
  project,
  isActive,
  incentiveCount,
  onSelect,
  customImage,
  onCustomImageChange,
  viewMode,
}: ProjectCard16x9Props) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const streetViewUrl = !customImage ? getStreetViewImageUrl(project.address) : null;
  const dummyImageUrl = getDummyImageForPropertyType(project.type);
  const imageUrl = customImage || streetViewUrl || dummyImageUrl;
  const showGradient = !imageUrl || imgError;

  // For text mode, show simple card
  if (viewMode === 'text') {
    return (
      <button
        type="button"
        onClick={() => onSelect(projectKey)}
        className={cn(
          'relative w-full p-3 rounded-lg overflow-hidden text-left transition-all duration-200',
          'border border-deep-200 dark:border-deep-700',
          'bg-white dark:bg-deep-900',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
          isActive
            ? 'ring-2 ring-teal-500 shadow-lg shadow-teal-500/20 bg-teal-50/50 dark:bg-teal-900/20'
            : 'hover:shadow-md hover:border-teal-500/50'
        )}
      >
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-deep-900 dark:text-white truncate">
            {project.name}
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-sage-600 dark:text-sage-400">{project.units} units</span>
            <span className="px-2 py-1 rounded-full bg-teal-500/20 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-semibold">
              {incentiveCount}
            </span>
          </div>
        </div>
      </button>
    );
  }

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        onCustomImageChange(projectKey, dataUrl);
      };
      reader.readAsDataURL(file);
      // Reset input so same file can be re-selected
      e.target.value = '';
    },
    [projectKey, onCustomImageChange]
  );

  const handleChangePhtoBtnClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      fileInputRef.current?.click();
    },
    []
  );

  return (
    <button
      type="button"
      onClick={() => onSelect(projectKey)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'relative w-full aspect-video rounded-xl overflow-hidden text-left transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
        isActive
          ? 'ring-2 ring-teal-500 shadow-lg shadow-teal-500/20 scale-[1.01]'
          : 'hover:scale-[1.02] hover:shadow-lg hover:shadow-black/30'
      )}
    >
      {/* Background image or gradient */}
      {!showGradient && imageUrl && (
        <Image
          src={imageUrl}
          alt={project.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
          onError={() => setImgError(true)}
          unoptimized={true}
          priority={isActive}
        />
      )}
      {(showGradient || !imageUrl) && (
        <GradientPlaceholder name={project.name} type={project.type} isActive={isActive} />
      )}

      {/* Dark gradient overlay — always present for text legibility */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-200',
          isActive ? 'opacity-90' : 'opacity-75'
        )}
      />

      {/* Selected ring highlight */}
      {isActive && (
        <div className="absolute inset-0 ring-2 ring-inset ring-teal-400/40 rounded-xl pointer-events-none" />
      )}

      {/* Top-right: edit pencil icon (visible on hover or active) */}
      {(hovered || isActive) && (
        <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1">
          <div
            className="h-5 w-5 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
            aria-hidden="true"
          >
            <Pencil className="h-2.5 w-2.5 text-white/80" />
          </div>
        </div>
      )}

      {/* "Change Photo" hover button */}
      {hovered && (
        <div className="absolute top-1.5 left-1.5 z-10">
          <button
            type="button"
            onClick={handleChangePhtoBtnClick}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white/90 text-[10px] font-medium hover:bg-black/80 transition-colors"
          >
            <Camera className="h-2.5 w-2.5" />
            Change Photo
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Bottom info overlay with sector metrics */}
      <div className="absolute bottom-0 left-0 right-0 p-2 z-10">
        <div className="flex flex-col items-start justify-between gap-1">
          <p className="text-white font-semibold text-[11px] leading-tight truncate max-w-[80%]">
            {project.name}
          </p>
          <div className="flex items-center gap-2 text-[8px]">
            <span className="text-white/80 font-mono">{project.units}</span>
            <span className="text-white/60">•</span>
            <span className="text-white/80 font-mono">{project.type}</span>
          </div>
          <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full bg-teal-500/90 backdrop-blur-sm text-white text-[8px] font-semibold whitespace-nowrap mt-1">
            {incentiveCount}
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── PortfolioCard16x9 ───────────────────────────────────────────────────────

interface PortfolioCard16x9Props {
  isActive: boolean;
  totalIncentives: number;
  projectCount: number;
  onSelect: () => void;
}

function PortfolioCard16x9({
  isActive,
  totalIncentives,
  projectCount,
  onSelect,
}: PortfolioCard16x9Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative w-full aspect-video rounded-xl overflow-hidden text-left transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
        isActive
          ? 'ring-2 ring-teal-500 shadow-lg shadow-teal-500/20 scale-[1.01]'
          : 'hover:scale-[1.02] hover:shadow-lg hover:shadow-black/30'
      )}
    >
      <PortfolioGradient isActive={isActive} projectCount={projectCount} />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      {isActive && (
        <div className="absolute inset-0 ring-2 ring-inset ring-teal-400/40 rounded-xl pointer-events-none" />
      )}

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-2 z-10">
        <div className="flex items-end justify-between gap-1">
          <div className="min-w-0">
            <p className="text-white font-semibold text-[11px] leading-tight">All Projects</p>
            <p className="text-white/65 font-mono text-[9px] mt-0.5">{projectCount} properties</p>
          </div>
          <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full bg-teal-500/80 backdrop-blur-sm text-white text-[9px] font-semibold whitespace-nowrap">
            {totalIncentives}
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── AddProjectCard16x9 ──────────────────────────────────────────────────────

interface AddProjectCard16x9Props {
  onClick: () => void;
}

function AddProjectCard16x9({ onClick }: AddProjectCard16x9Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative w-full aspect-video rounded-xl overflow-hidden text-left transition-all duration-200',
        'border-2 border-dashed border-deep-200 dark:border-deep-700',
        'bg-deep-50/50 dark:bg-deep-900/50',
        'hover:border-teal-400 dark:hover:border-teal-500',
        'hover:bg-teal-50/30 dark:hover:bg-teal-900/20',
        'hover:scale-[1.02]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500'
      )}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div className="h-8 w-8 rounded-full bg-deep-100 dark:bg-deep-800 flex items-center justify-center">
          <Plus className="h-4 w-4 text-teal-500" />
        </div>
        <span className="text-[11px] font-semibold text-sage-500 dark:text-sage-400">
          Add Project
        </span>
      </div>
    </button>
  );
}

// ─── V44ProjectSelector (main export) ────────────────────────────────────────

export function V44ProjectSelector({
  currentProject,
  onSelect,
}: V44ProjectSelectorProps) {
  const [showAll, setShowAll] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'image' | 'text'>('image');
  // Map of projectKey → custom data URL (overrides street view image)
  const [customImages, setCustomImages] = useState<Record<string, string>>(() => {
    // Hydrate from localStorage on first render
    const loaded: Record<string, string> = {};
    Object.keys(projectData).forEach((k) => {
      const stored = loadCustomImage(k);
      if (stored) loaded[k] = stored;
    });
    return loaded;
  });
  // State for add project form
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    units: '',
    type: '',
    tdc: '',
  });
  const [verifyingAddress, setVerifyingAddress] = useState(false);

  const projectKeys = Object.keys(projectData);
  const totalProjects = projectKeys.length;

  const allItems = ['portfolio', ...projectKeys];
  const visibleItems = showAll ? allItems : allItems.slice(0, CARDS_PER_ROW);
  const hasOverflow = allItems.length + 1 > CARDS_PER_ROW; // +1 for Add card

  const selectedProject = currentProject !== 'portfolio' ? projectData[currentProject] : null;
  const totalIncentives = Object.values(allIncentives).reduce((sum, arr) => sum + arr.length, 0);
  const incentiveCount =
    currentProject === 'portfolio'
      ? totalIncentives
      : (allIncentives[currentProject] || []).length;

  const handleCustomImageChange = useCallback((key: string, dataUrl: string) => {
    saveCustomImage(key, dataUrl);
    setCustomImages((prev) => ({ ...prev, [key]: dataUrl }));
  }, []);

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      {totalProjects >= 10 && (
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs font-medium text-sage-600 dark:text-sage-400">View:</span>
          <div className="inline-flex gap-1 p-1 rounded-lg bg-deep-100/50 dark:bg-deep-800/50">
            <button
              onClick={() => setViewMode('image')}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-all',
                viewMode === 'image'
                  ? 'bg-white dark:bg-deep-900 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-sage-600 dark:text-sage-400 hover:text-sage-900 dark:hover:text-sage-200'
              )}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Images</span>
            </button>
            <button
              onClick={() => setViewMode('text')}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-all',
                viewMode === 'text'
                  ? 'bg-white dark:bg-deep-900 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-sage-600 dark:text-sage-400 hover:text-sage-900 dark:hover:text-sage-200'
              )}
            >
              <ListIcon className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>
      )}

      {/* Project Grid — responsive with 8 cards max per row */}
      <div className={cn(
        'gap-2',
        viewMode === 'image'
          ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 2xl:grid-cols-8'
          : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5'
      )}>
        {visibleItems.map((key) => {
          const isPortfolio = key === 'portfolio';

          if (isPortfolio) {
            return (
              <PortfolioCard16x9
                key="portfolio"
                isActive={currentProject === 'portfolio'}
                totalIncentives={totalIncentives}
                projectCount={totalProjects}
                onSelect={() => onSelect('portfolio')}
              />
            );
          }

          const project = projectData[key];
          if (!project) return null;

          const count = (allIncentives[key] || []).length;

          return (
            <ProjectCard16x9
              key={key}
              projectKey={key}
              project={project}
              isActive={currentProject === key}
              incentiveCount={count}
              onSelect={onSelect}
              customImage={customImages[key] ?? null}
              onCustomImageChange={handleCustomImageChange}
              viewMode={viewMode}
            />
          );
        })}

        {/* Add Project Card */}
        <AddProjectCard16x9 onClick={() => setShowAddModal(true)} />
      </div>

      {/* Show More / Less toggle for large portfolios */}
      {hasOverflow && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-1 text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline mx-auto"
        >
          {showAll ? (
            <>Show less <ChevronUp className="h-3 w-3" /></>
          ) : (
            <>Show all {allItems.length} projects <ChevronDown className="h-3 w-3" /></>
          )}
        </button>
      )}

      {/* Project meta strip */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {selectedProject ? (
          <>
            <span className="text-sage-600 dark:text-sage-500">
              Units:{' '}
              <span className="font-mono font-semibold text-deep-950 dark:text-sage-200">
                {selectedProject.units}
              </span>
            </span>
            <span className="text-sage-300 dark:text-teal-800">|</span>
            <span className="text-sage-600 dark:text-sage-500">
              TDC:{' '}
              <span className="font-mono font-semibold text-deep-950 dark:text-sage-200">
                {formatCompactCurrency(selectedProject.tdc * 1_000_000)}
              </span>
            </span>
            <span className="text-sage-300 dark:text-teal-800">|</span>
            <span className="text-sage-600 dark:text-sage-500">
              Incentives:{' '}
              <span className="font-mono font-semibold text-deep-950 dark:text-sage-200">
                {incentiveCount}
              </span>
            </span>
          </>
        ) : (
          <>
            <span className="text-sage-600 dark:text-sage-500">
              Projects:{' '}
              <span className="font-mono font-semibold text-deep-950 dark:text-sage-200">
                {totalProjects}
              </span>
            </span>
            <span className="text-sage-300 dark:text-teal-800">|</span>
            <span className="text-sage-600 dark:text-sage-500">
              Total Incentives:{' '}
              <span className="font-mono font-semibold text-deep-950 dark:text-sage-200">
                {incentiveCount}
              </span>
            </span>
          </>
        )}
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-deep-900 rounded-2xl shadow-2xl border border-deep-100 dark:border-deep-700 w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-sora text-lg font-bold text-deep-900 dark:text-white mb-4">
              Add New Project
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-deep-700 dark:text-sage-300 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Bronx Gateway Tower"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-deep-200 dark:border-deep-700 bg-white dark:bg-deep-800 text-deep-900 dark:text-deep-100 text-sm placeholder:text-sage-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-deep-700 dark:text-sage-300 mb-1">
                  Address {verifyingAddress && <span className="text-xs text-teal-500">• Verifying...</span>}
                </label>
                <input
                  type="text"
                  placeholder="e.g., 225 Grand Concourse, Bronx, NY 10451"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                  }}
                  onBlur={() => {
                    if (formData.address) {
                      setVerifyingAddress(true);
                      // Simulate address verification delay
                      setTimeout(() => setVerifyingAddress(false), 500);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-deep-200 dark:border-deep-700 bg-white dark:bg-deep-800 text-deep-900 dark:text-deep-100 text-sm placeholder:text-sage-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                />
                <p className="text-xs text-sage-500 dark:text-sage-400 mt-1">
                  When you enter an address, we'll automatically fetch the Street View image
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-deep-700 dark:text-sage-300 mb-1">
                    Units
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 312"
                    value={formData.units}
                    onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-deep-200 dark:border-deep-700 bg-white dark:bg-deep-800 text-deep-900 dark:text-deep-100 text-sm placeholder:text-sage-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-deep-700 dark:text-sage-300 mb-1">
                    Project Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-deep-200 dark:border-deep-700 bg-white dark:bg-deep-800 text-deep-900 dark:text-deep-100 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                  >
                    <option value="">Select type</option>
                    <option value="mixed-use">Mixed-Use</option>
                    <option value="multifamily">Multifamily</option>
                    <option value="affordable-housing">Affordable Housing</option>
                    <option value="transit-oriented">Transit-Oriented</option>
                    <option value="industrial">Industrial</option>
                    <option value="office">Office</option>
                    <option value="retail">Retail</option>
                    <option value="hotel">Hotel</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="solar">Solar</option>
                    <option value="warehouse">Warehouse</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-deep-700 dark:text-sage-300 mb-1">
                  Total Development Cost (TDC)
                </label>
                <input
                  type="text"
                  placeholder="e.g., $125,000,000"
                  value={formData.tdc}
                  onChange={(e) => setFormData({ ...formData, tdc: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-deep-200 dark:border-deep-700 bg-white dark:bg-deep-800 text-deep-900 dark:text-deep-100 text-sm placeholder:text-sage-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({ name: '', address: '', units: '', type: '', tdc: '' });
                }}
                className="px-4 py-2 text-sm font-medium text-deep-600 dark:text-sage-400 hover:text-deep-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!formData.name || !formData.address || !formData.type}
                onClick={() => {
                  // Here you'd implement adding the project to your data source
                  setShowAddModal(false);
                  setFormData({ name: '', address: '', units: '', type: '', tdc: '' });
                }}
                className="px-5 py-2 rounded-lg bg-deep-900 dark:bg-teal-600 text-white text-sm font-semibold hover:bg-deep-800 dark:hover:bg-teal-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
