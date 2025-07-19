# IncentEdge - Professional Investment Platform

## Overview
IncentEdge is a professional web application designed for institutional investors and developers to discover and secure sustainable building incentives. The platform features a modern 2025 GUI/UX design with comprehensive database integration and now includes Python web scraper integration for live data collection.

## Project Architecture
- **Frontend**: React with TypeScript, Wouter routing, TanStack Query, Tailwind CSS
- **Backend**: Node.js with Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Modern 2025 professional design with glass morphism, gradients, Inter font
- **Data Integration**: Python web scraper integration for live government incentive data

## Recent Changes
- **Migration Complete**: Successfully migrated project from Replit Agent to Replit environment (July 18, 2025)
- **Database Migration**: Successfully migrated from in-memory to PostgreSQL storage with full data preservation
- **Infrastructure Setup**: Configured production environment with proper dependencies and server configuration
- **Development Environment**: Fixed development server startup and resolved deployment issues
- **Database Integration**: Successfully migrated from in-memory to PostgreSQL storage
- **Professional Design**: Implemented 2025 CBRE investor relations aesthetic with modern components
- **Python Scraper Integration**: Added support for live data scraping with API endpoints and frontend controls
- **YAML Generator**: Created automated YAML configuration generator for adding new websites without manual coding
- **Extended Configs**: Added 14 comprehensive YAML configurations including CDFI, DOE Buildings, DSIRE, EPA, HUD, multiple IRS programs, and enhanced NYSERDA with direct solicitation URLs
- **OpenAI Integration**: Successfully integrated OpenAI API for AI-powered data extraction from government websites and PDFs
- **Error Logging**: Added comprehensive error logging and job monitoring with detailed logs accessible through browser console
- **AI Scraper Operational**: Fixed all path resolution issues, scraper now successfully connects to government websites, detects PDFs, and processes content with AI extraction
- **Enhanced Data Extraction**: Updated AI agent and scraper to extract specific fields needed: Program Name, Provider/Level, Amount Available, Deadline/Status, Project Types
- **Fallback Extraction**: Added comprehensive pattern matching system for when OpenAI quota is exceeded, ensuring data extraction continues without API dependency
- **Scraper Testing**: Validated extraction capabilities with sample data showing successful field extraction for Program Name, Provider/Level, Amount Available, Deadline/Status, Project Types
- **Results Display Fixed**: Corrected frontend parsing of scraped data to show extracted government incentive details properly in user interface
- **Auto-Processing Pipeline**: Implemented automatic data flow from scraper to main incentives database for real-time market updates
- **Live Data Integration**: Updated hero section dashboard to display real-time program counts from scraped data, showing current federal (3), state (5), local (2), and utility (1) programs from live government sources
- **Automated Processing Pipeline**: Implemented automatic data processing so scraped government incentive data flows directly into main database without manual intervention, enabling real-time market updates
- **Complete Rebranding**: Successfully rebranded platform from SubsidySync to IncentEdge across all components, including logo redesign with actual gradient logo image, updated all navigation, content, and documentation
- **DeepSeek V3 Integration**: Switched from OpenAI to DeepSeek V3 API for 65% cost savings and 4x larger context windows for better PDF processing
- **Enhanced Chart Visualizations**: Added vibrant professional color schemes to dashboard charts with blue federal, green state, red local programs and emerald efficiency, amber renewable technology categories
- **UI Icon Consistency**: Fixed missing icons in "Why Use IncentEdge?" section with blue search, green file, and purple clipboard icons for complete visual hierarchy
- **Database Expansion Complete**: Successfully scaled from 32 to 90 comprehensive government incentive programs using GPT-3.5-turbo extraction, achieving $82.1B+ in tracked funding across federal, state, local, and utility programs
- **Filter System Rebuilt**: Fixed all filter functionality with accurate categorization based on real database values - status filters now correctly categorize all 90 programs with precise counts, project type filtering works for retrofits/commercial/multifamily, technology filtering active for energy storage/solar/HVAC, and pagination displays accurate results
- **Customer-Focused UX Transformation**: Replaced technical AI scraper page with professional "Data Sources" page showing market intelligence dashboard, moved scraper controls to admin-only route with discrete access button in header, implemented functional CSV export, and removed redundant Advanced filter button
- **Live Scraper Operational**: Fixed all critical scraper issues - switched from DeepSeek to OpenAI GPT-3.5 API, resolved Python import path errors, established complete data pipeline from government websites to main database, successfully extracted and processed "Residential Clean Energy Credit" from IRS website increasing total programs to 91
- **Real-Time Filter Updates**: Fixed status filter dropdown to show dynamic counts instead of hardcoded values, now displays "All Statuses (91)" with accurate real-time program counts across all filter categories after each scraping job
- **Complete Filter Coverage**: Fixed project type filters to match actual database content, replacing mismatched categories with accurate ones (Energy Efficiency, Renewable Energy, Solar, Transportation/EV, Climate & Resilience, Advanced Technologies) achieving 100% coverage of all programs
- **Database Cleanup**: Comprehensive cleanup removing out-of-state programs, keeping only NY, NJ, CT, and multi-state programs plus all federal, utility, and foundation programs. Reduced from 91 to focused dataset with streamlined geographic coverage
- **Geographic Focus**: Retained New York, New Jersey, Connecticut state programs plus multi-state initiatives, providing targeted regional coverage for institutional investors
- **CSV Data Expansion**: Successfully imported 17 additional validated programs from 200+ CSV entries, expanding database from 58 to 75 total programs with $24B additional funding tracked (now $102.6B+ total)
- **Major Database Expansion**: Imported comprehensive CSV dataset expanding from 10 to 187 total incentive programs, adding 177 new federal, state, local, utility, and foundation programs for complete market coverage
- **Program Validation Pipeline**: Implemented comprehensive filtering system removing PDFs, duplicates, non-English entries, and invalid data while preserving legitimate government incentive programs
- **Enhanced Federal Coverage**: Significantly expanded federal program coverage with EPA environmental programs ($54B), comprehensive IRS tax credits, and DOE building initiatives
- **Target Website Integration**: Successfully extracted 195 target websites from user PDF and created batch scraping system with priority government sites (DOE, EPA, IRS, HUD, USDA, SBA, NYSERDA, NY ESD)
- **Comprehensive Deep Crawling Complete**: Successfully processed all 195 target websites with AI-powered PDF extraction, expanding database from 155 to 195 programs worth $218.4B+ total funding
- **Enhanced NY/Multi-State Coverage**: Added 41 New York and regional programs including 27 state programs, 12 local NYC/county programs, plus 20 Northeast corridor state programs for comprehensive institutional investor coverage
- **Data Sources Dashboard Updated**: Refreshed monitoring display to show 12 comprehensive source categories tracking 195 programs across federal (75), state (53), local (13), utility (18), and foundation (19) levels
- **Logo Integration Complete**: Replaced text-based logo with actual IncentEdge gradient logo image, created matching favicon, increased logo prominence (h-36) and positioned prominently in navigation for professional brand presence
- **Enhanced Incentive Calculator**: Significantly expanded calculator with comprehensive input fields including location, building type, energy efficiency measures, ownership type, construction year, energy usage, sustainability certifications, and qualification checkboxes for more accurate incentive calculations
- **Mobile-First Navigation**: Improved header layout with collapsible hamburger menu for tablets and mobile devices, ensuring logo prominence while maintaining professional navigation on all screen sizes
- **Geographic Expansion**: Updated all website content to reflect expanded Northeast regional coverage from NYC/NY/Westchester to include New Jersey, Pennsylvania, Rhode Island, Maine, Massachusetts, Delaware, Vermont, and New Hampshire
- **Navigation Fixes**: Fixed call-to-action buttons in homepage hero section to properly link Schedule Consultation to contact page and View Case Studies to incentives page

## User Preferences
- Professional, institutional-grade design aesthetic
- Modern 2025 GUI/UX trends
- Real-time data integration capabilities
- Executive-level navigation and functionality

## Technical Stack
- TypeScript, React, Express, PostgreSQL, Drizzle ORM
- TailwindCSS with professional color schemes
- Glass morphism and gradient design elements
- Real-time data synchronization