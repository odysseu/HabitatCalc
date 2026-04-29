#!/usr/bin/env node

/**
 * Formats the coverage-summary.json file for better readability
 */

const fs = require('fs');
const path = require('path');

const COVERAGE_SUMMARY_PATH = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');

function formatCoverageSummary() {
    try {
        // Read the coverage summary file
        const rawData = fs.readFileSync(COVERAGE_SUMMARY_PATH, 'utf8');
        
        // Parse JSON
        const coverageData = JSON.parse(rawData);
        
        // Format with 2-space indentation
        const formattedData = JSON.stringify(coverageData, null, 2);
        
        // Write back formatted JSON
        fs.writeFileSync(COVERAGE_SUMMARY_PATH, formattedData + '\n', 'utf8');
        
        console.log('✓ coverage-summary.json formatted successfully');
        
        // Also format the lcov.info if it exists
        const lcovPath = path.join(__dirname, '..', 'coverage', 'lcov.info');
        if (fs.existsSync(lcovPath)) {
            const lcovData = fs.readFileSync(lcovPath, 'utf8');
            // lcov files are not JSON, so we can't format them
            // but we can ensure it ends with a newline
            if (!lcovData.endsWith('\n')) {
                fs.writeFileSync(lcovPath, lcovData + '\n', 'utf8');
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error formatting coverage-summary.json:', error.message);
        return false;
    }
}

// Run the formatter
formatCoverageSummary();
