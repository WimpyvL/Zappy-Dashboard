# Zappy Dashboard - Codebase Reorganization Script
# Created: May 1, 2025
# Description: This script reorganizes the codebase to follow a more consistent structure

# Function to create directory if it doesn't exist
function EnsureDirectory {
    param (
        [string]$path
    )
    
    if (-not (Test-Path $path)) {
        Write-Host "Creating directory: $path" -ForegroundColor Green
        New-Item -ItemType Directory -Path $path -Force | Out-Null
    }
}

# Function to safely copy files
function SafeCopy {
    param (
        [string]$source,
        [string]$destination
    )
    
    if (Test-Path $source) {
        Write-Host "Copying from $source to $destination" -ForegroundColor Cyan
        
        # Create the destination directory if it doesn't exist
        $destDir = Split-Path -Path $destination -Parent
        EnsureDirectory -path $destDir
        
        # Copy the file
        Copy-Item -Path $source -Destination $destination -Force
    }
    else {
        Write-Host "Source not found: $source" -ForegroundColor Yellow
    }
}

# Function to safely move directories
function SafeMoveDirectory {
    param (
        [string]$source,
        [string]$destination
    )
    
    if (Test-Path $source) {
        Write-Host "Moving directory from $source to $destination" -ForegroundColor Cyan
        
        # Create the destination parent directory if it doesn't exist
        $destParent = Split-Path -Path $destination -Parent
        EnsureDirectory -path $destParent
        
        # First ensure the destination directory exists
        EnsureDirectory -path $destination
        
        # Copy all items from source to destination
        Get-ChildItem -Path $source -Recurse | ForEach-Object {
            $destPath = $_.FullName.Replace($source, $destination)
            
            if ($_.PSIsContainer) {
                EnsureDirectory -path $destPath
            }
            else {
                $destDir = Split-Path -Path $destPath -Parent
                EnsureDirectory -path $destDir
                Copy-Item -Path $_.FullName -Destination $destPath -Force
            }
        }
    }
    else {
        Write-Host "Source directory not found: $source" -ForegroundColor Yellow
    }
}

# Main execution starts here
$rootDir = "c:\Git Repos\Zappy-Dashboard"
$srcDir = Join-Path $rootDir "src"

Write-Host "Starting Zappy Dashboard codebase reorganization..." -ForegroundColor Magenta
Write-Host "Root directory: $rootDir" -ForegroundColor Magenta
Write-Host "Source directory: $srcDir" -ForegroundColor Magenta

# Create backup of current structure
$backupDir = Join-Path $rootDir "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "Creating backup in: $backupDir" -ForegroundColor Green
Copy-Item -Path $srcDir -Destination $backupDir -Recurse

# ===== PHASE 1: Consolidate context directories =====
Write-Host "`nPHASE 1: Consolidating context directories..." -ForegroundColor Magenta

# Ensure contexts directory exists
$contextsDir = Join-Path $srcDir "contexts"
EnsureDirectory -path $contextsDir

# Create subdirectories for different context domains
$authContextDir = Join-Path $contextsDir "auth"
$appContextDir = Join-Path $contextsDir "app"
$cartContextDir = Join-Path $contextsDir "cart"
$routeContextDir = Join-Path $contextsDir "route"

EnsureDirectory -path $authContextDir
EnsureDirectory -path $appContextDir
EnsureDirectory -path $cartContextDir
EnsureDirectory -path $routeContextDir

# Move files from context to contexts with appropriate subdirectories
SafeCopy -source (Join-Path $srcDir "context\AuthContext.jsx") -destination (Join-Path $authContextDir "AuthContext.jsx")
SafeCopy -source (Join-Path $srcDir "context\AuthContext.test.jsx") -destination (Join-Path $authContextDir "AuthContext.test.jsx")
SafeCopy -source (Join-Path $srcDir "context\AppContext.jsx") -destination (Join-Path $appContextDir "AppContext.jsx")
SafeCopy -source (Join-Path $srcDir "context\AppContext.test.jsx") -destination (Join-Path $appContextDir "AppContext.test.jsx")
SafeCopy -source (Join-Path $srcDir "context\CartContext.jsx") -destination (Join-Path $cartContextDir "CartContext.jsx")
SafeCopy -source (Join-Path $srcDir "context\CartContext.test.jsx") -destination (Join-Path $cartContextDir "CartContext.test.jsx")
SafeCopy -source (Join-Path $srcDir "context\RouteTrackerContext.jsx") -destination (Join-Path $routeContextDir "RouteTrackerContext.jsx")

# Create an index.js to export all contexts
$contextsIndexContent = @"
// Consolidated contexts index file
// Export all contexts for easy imports

// Auth contexts
export * from './auth/AuthContext';

// App contexts
export * from './app/AppContext';

// Cart contexts
export * from './cart/CartContext';

// Route contexts
export * from './route/RouteTrackerContext';
"@

$contextsIndexPath = Join-Path $contextsDir "index.js"
Set-Content -Path $contextsIndexPath -Value $contextsIndexContent

# ===== PHASE 2: Reorganize components directory =====
Write-Host "`nPHASE 2: Reorganizing components directory..." -ForegroundColor Magenta

$componentsDir = Join-Path $srcDir "components"
EnsureDirectory -path $componentsDir

# Create new component directories
$commonCompsDir = Join-Path $componentsDir "common"
$domainCompsDir = Join-Path $componentsDir "domain"
$uiCompsDir = Join-Path $componentsDir "ui"

EnsureDirectory -path $commonCompsDir
EnsureDirectory -path $domainCompsDir
EnsureDirectory -path $uiCompsDir

# Create domain-specific subdirectories
$domainsToCreate = @("patients", "insurance", "pharmacy", "orders", "providers", "consultations", "forms", "billing")
foreach ($domain in $domainsToCreate) {
    EnsureDirectory -path (Join-Path $domainCompsDir $domain)
}

# Create UI component subdirectories
$uiSubdirs = @("buttons", "cards", "forms", "inputs", "loaders", "modals", "tables", "typography", "icons")
foreach ($subdir in $uiSubdirs) {
    EnsureDirectory -path (Join-Path $uiCompsDir $subdir)
}

# Move existing component directories to their new locations
# Handle notifications components
SafeMoveDirectory -source (Join-Path $componentsDir "notifications") -destination (Join-Path $uiCompsDir "notifications")

# Handle orders components
SafeMoveDirectory -source (Join-Path $componentsDir "orders") -destination (Join-Path $domainCompsDir "orders")

# Handle notes components
SafeMoveDirectory -source (Join-Path $componentsDir "notes") -destination (Join-Path $domainCompsDir "notes")

# ===== PHASE 3: Standardize API layer =====
Write-Host "`nPHASE 3: Standardizing API layer..." -ForegroundColor Magenta

# APIs are already well-organized, so we'll just ensure consistent structure
$apisDir = Join-Path $srcDir "apis"
$apiDomains = Get-ChildItem -Path $apisDir -Directory | Select-Object -ExpandProperty Name

foreach ($domain in $apiDomains) {
    $domainDir = Join-Path $apisDir $domain
    
    # Check for required files and create placeholder if missing
    $apiFile = Join-Path $domainDir "api.js"
    $hooksFile = Join-Path $domainDir "hooks.js"
    $typesFile = Join-Path $domainDir "types.js"
    $utilsFile = Join-Path $domainDir "utils.js"
    
    if (-not (Test-Path $apiFile)) {
        $apiContent = @"
// API endpoint definitions for $domain
// Created by reorganization script

const ${domain}Api = {
  // TODO: Add API endpoint definitions
};

export default ${domain}Api;
"@
        Set-Content -Path $apiFile -Value $apiContent
    }
    
    if (-not (Test-Path $hooksFile)) {
        $hooksContent = @"
// Custom hooks for $domain
// Created by reorganization script

import { useQuery, useMutation } from 'react-query';
import ${domain}Api from './api';

// TODO: Add hooks for this domain

export {};
"@
        Set-Content -Path $hooksFile -Value $hooksContent
    }
    
    if (-not (Test-Path $typesFile)) {
        $typesContent = @"
// TypeScript types for $domain
// Created by reorganization script

// TODO: Add types for this domain

export {};
"@
        Set-Content -Path $typesFile -Value $typesContent
    }
    
    if (-not (Test-Path $utilsFile)) {
        $utilsContent = @"
// Utility functions for $domain
// Created by reorganization script

// TODO: Add utility functions for this domain

export {};
"@
        Set-Content -Path $utilsFile -Value $utilsContent
    }
}

# ===== PHASE 4: Consolidate Documentation =====
Write-Host "`nPHASE 4: Consolidating documentation..." -ForegroundColor Magenta

# Create documentation directory structure
$docsDir = Join-Path $rootDir "docs"
EnsureDirectory -path $docsDir

$docCategories = @{
    "architecture" = @("CODEBASE_DIAGRAM.md", "CODEBASE_OVERVIEW.md", "databasexp.md", "SYSTEM_MAP_FEATURE_TODO.md")
    "development" = @("REFACTORING_CHANGELOG.md", "IMPROVEMENT_AREAS.md", "BUGFIX_TODO.md", "AUTOMATION_FEATURE_TODO.md")
    "api" = @("SERVICE_IMPLEMENTATION.md", "SERVICE_PERFORMANCE_OPTIMIZATIONS.md", "SUPABASE_SERVICE_MIGRATION.md")
    "deployment" = @("MIGRATION_TROUBLESHOOTING.md", "POSTGRES_SETUP_TODO.md")
    "troubleshooting" = @("BUG_TRACKING.md", "SERVICE_TROUBLESHOOTING.md", "SESSION_SUMMARY.md")
    "security" = @("SECURITY.md")
}

foreach ($category in $docCategories.Keys) {
    $categoryDir = Join-Path $docsDir $category
    EnsureDirectory -path $categoryDir
    
    foreach ($docFile in $docCategories[$category]) {
        $sourceFile = Join-Path $rootDir "Updated\$docFile"
        $destFile = Join-Path $categoryDir $docFile
        SafeCopy -source $sourceFile -destination $destFile
    }
}

# Copy README.md
SafeCopy -source (Join-Path $rootDir "Updated\README.md") -destination (Join-Path $docsDir "README.md")

# Create an index file with links to all documentation
$docsIndexContent = @"
# Zappy Dashboard Documentation

## Categories

### Architecture
$(foreach ($doc in $docCategories["architecture"]) { "- [$doc](./architecture/$doc)`n" })

### Development
$(foreach ($doc in $docCategories["development"]) { "- [$doc](./development/$doc)`n" })

### API
$(foreach ($doc in $docCategories["api"]) { "- [$doc](./api/$doc)`n" })

### Deployment
$(foreach ($doc in $docCategories["deployment"]) { "- [$doc](./deployment/$doc)`n" })

### Troubleshooting
$(foreach ($doc in $docCategories["troubleshooting"]) { "- [$doc](./troubleshooting/$doc)`n" })

### Security
$(foreach ($doc in $docCategories["security"]) { "- [$doc](./security/$doc)`n" })
"@

$docsIndexPath = Join-Path $docsDir "index.md"
Set-Content -Path $docsIndexPath -Value $docsIndexContent

# ===== PHASE 5: Create index exports for hooks =====
Write-Host "`nPHASE 5: Standardizing hooks organization..." -ForegroundColor Magenta

$hooksDir = Join-Path $srcDir "hooks"
EnsureDirectory -path $hooksDir

# Create an index file to export all hooks
$hooksFiles = Get-ChildItem -Path $hooksDir -File | Where-Object { $_.Extension -eq ".js" -or $_.Extension -eq ".jsx" } | Select-Object -ExpandProperty Name

$hooksExports = @()
foreach ($hookFile in $hooksFiles) {
    $hookName = [System.IO.Path]::GetFileNameWithoutExtension($hookFile)
    $hooksExports += "export * from './$hookFile';"
}

$hooksIndexContent = @"
// Hooks index file - exports all hooks
// Created by reorganization script

$($hooksExports -join "`n")
"@

$hooksIndexPath = Join-Path $hooksDir "index.js"
Set-Content -Path $hooksIndexPath -Value $hooksIndexContent

# ===== PHASE 6: Create a migration guide =====
Write-Host "`nPHASE 6: Creating migration guide..." -ForegroundColor Magenta

$migrationGuideContent = @"
# Zappy Dashboard Codebase Restructuring Guide

## Overview

This document provides an overview of the codebase restructuring performed on May 1, 2025.

## Directory Structure Changes

1. **Consolidated Context Management**
   - Combined `context/` and `contexts/` into a single `contexts/` directory
   - Organized contexts by domain (auth, app, cart, route)
   - Added an index.js for easy imports

2. **Improved Component Organization**
   - Reorganized components into:
     - `common/`: Truly common components used across the app
     - `domain/`: Domain-specific components that aren't full pages
     - `ui/`: Pure UI components with no business logic

3. **Standardized API Layer**
   - Ensured consistent structure in each API domain folder:
     - api.js: API endpoint definitions
     - hooks.js: Custom hooks using the API
     - types.js: TypeScript types for this domain
     - utils.js: Domain-specific utilities

4. **Consolidated Documentation**
   - Moved all documentation from `Updated/` to a centralized `docs/` folder
   - Organized documentation by category

5. **Standardized Hooks Organization**
   - Added an index.js to export all hooks

## Migration Challenges

- Some files may have been missed in the migration
- Import paths in existing files will need to be updated
- Tests may need to be updated to reflect new file locations

## Next Steps

1. Update import paths in all files
2. Run tests to identify and fix any issues
3. Remove old directories after confirming everything works

## Original Backup

A complete backup of the original structure was created at:
$backupDir
"@

$migrationGuidePath = Join-Path $docsDir "MIGRATION_GUIDE.md"
Set-Content -Path $migrationGuidePath -Value $migrationGuideContent

# ===== COMPLETE =====
Write-Host "`nCodebase reorganization complete!" -ForegroundColor Green
Write-Host "A backup of your original structure is available at: $backupDir" -ForegroundColor Green
Write-Host "Please check the migration guide at: $migrationGuidePath" -ForegroundColor Green
Write-Host "`nIMPORTANT: You will need to update import paths in your files to reflect the new structure." -ForegroundColor Yellow
Write-Host "Run your tests after reviewing changes to ensure everything works correctly." -ForegroundColor Yellow