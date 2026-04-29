#!/usr/bin/env node

/**
 * Formats the coverage-summary.json file using jq for better readability
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COVERAGE_SUMMARY_PATH = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');

function formatCoverageSummary() {
    try {
        // Use jq to format the JSON with 2-space indentation
        execSync(`jq '.' ${COVERAGE_SUMMARY_PATH} > ${COVERAGE_SUMMARY_PATH}.tmp && mv ${COVERAGE_SUMMARY_PATH}.tmp ${COVERAGE_SUMMARY_PATH}`, { encoding: 'utf8' });
        
        console.log('✓ coverage-summary.json formatted successfully with jq');
        
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
