/**
 * @jest-environment jsdom
 */

import { addVectorChartToPDF, addPDFHeader, createCollapsibleResultsSection, addRepaymentYear } from '../js/report-handler.js';

describe('Report Handler Vector Chart and Coverage Tests', () => {
    const margin = 20;
    const availableWidth = 100;
    const tableSpacing = 10;
    const translations = {
        year: 'Year',
        years: 'Years',
        month: 'Month',
        months: 'Months',
        and: 'and',
        reportRepaymentYear: 'Repayment Year',
        currencyFormat: 'fr-FR'
    };

    describe('addVectorChartToPDF', () => {
        let doc;

        beforeEach(() => {
            // Mock jsPDF
            global.jspdf = {
                jsPDF: jest.fn().mockImplementation(() => ({
                    setProperties: jest.fn(),
                    internal: {
                        pageSize: {
                            getHeight: jest.fn().mockReturnValue(297),
                            getWidth: jest.fn().mockReturnValue(210),
                        },
                    },
                    lastAutoTable: null,
                    setDrawColor: jest.fn(),
                    setFillColor: jest.fn(),
                    setLineWidth: jest.fn(),
                    rect: jest.fn(),
                    line: jest.fn(),
                    text: jest.fn(),
                    moveTo: jest.fn(),
                    lineTo: jest.fn(),
                    stroke: jest.fn(),
                    fill: jest.fn(),
                    setFontSize: jest.fn(),
                    setTextColor: jest.fn(),
                    getTextWidth: jest.fn(() => 20),
                    addPage: jest.fn(),
                    save: jest.fn(),
                    addImage: jest.fn()
                }))
            };
            doc = new global.jspdf.jsPDF();
        });

        afterEach(() => {
            doc = null;
            delete global.jspdf;
        });

        it('should draw chart with valid parameters', () => {
            const cumulRent = [10000, 20000, 30000, 40000, 50000];
            const cumulativePurchase = [50000, 60000, 70000, 80000, 90000];
            const maxDuration = 5;
            const pivot = { years: 3, months: 0, totalMonths: 36 };

            expect(() => {
                addVectorChartToPDF(doc, margin, availableWidth, tableSpacing, cumulRent, cumulativePurchase, maxDuration, pivot, translations);
            }).not.toThrow();
        });

        it('should handle empty arrays', () => {
            const cumulRent = [];
            const cumulativePurchase = [];
            const maxDuration = 0;
            const pivot = { years: 0, months: 0, totalMonths: 0 };

            expect(() => {
                addVectorChartToPDF(doc, margin, availableWidth, tableSpacing, cumulRent, cumulativePurchase, maxDuration, pivot, translations);
            }).not.toThrow();
        });

        it('should handle single value arrays', () => {
            const cumulRent = [10000];
            const cumulativePurchase = [50000];
            const maxDuration = 1;
            const pivot = { years: 1, months: 0, totalMonths: 12 };

            expect(() => {
                addVectorChartToPDF(doc, margin, availableWidth, tableSpacing, cumulRent, cumulativePurchase, maxDuration, pivot, translations);
            }).not.toThrow();
        });

        it('should handle null pivot', () => {
            const cumulRent = [10000, 20000];
            const cumulativePurchase = [50000, 60000];
            const maxDuration = 2;

            expect(() => {
                addVectorChartToPDF(doc, margin, availableWidth, tableSpacing, cumulRent, cumulativePurchase, maxDuration, null, translations);
            }).not.toThrow();
        });

        it('should handle pivot with months', () => {
            const cumulRent = [10000, 20000, 30000, 40000, 50000];
            const cumulativePurchase = [50000, 60000, 70000, 80000, 90000];
            const maxDuration = 5;
            const pivot = { years: 2, months: 6, totalMonths: 30 };

            expect(() => {
                addVectorChartToPDF(doc, margin, availableWidth, tableSpacing, cumulRent, cumulativePurchase, maxDuration, pivot, translations);
            }).not.toThrow();
        });

        it('should handle negative values', () => {
            const cumulRent = [-10000, -20000, -30000];
            const cumulativePurchase = [50000, 60000, 70000];
            const maxDuration = 3;
            const pivot = { years: 1, months: 0, totalMonths: 12 };

            expect(() => {
                addVectorChartToPDF(doc, margin, availableWidth, tableSpacing, cumulRent, cumulativePurchase, maxDuration, pivot, translations);
            }).not.toThrow();
        });
    });

    describe('addPDFHeader', () => {
        let doc;

        beforeEach(() => {
            global.jspdf = {
                jsPDF: jest.fn().mockImplementation(() => ({
                    setFontSize: jest.fn(),
                    setTextColor: jest.fn(),
                    text: jest.fn()
                }))
            };
            doc = new global.jspdf.jsPDF();
        });

        afterEach(() => {
            doc = null;
            delete global.jspdf;
        });

        it('should add header without throwing', () => {
            expect(() => {
                addPDFHeader(doc, translations, margin);
            }).not.toThrow();
        });

        it('should handle empty translations', () => {
            const emptyTranslations = { reportTitle: '' };
            expect(() => {
                addPDFHeader(doc, emptyTranslations, margin);
            }).not.toThrow();
        });

        it('should handle missing reportTitle', () => {
            const emptyTranslations = { reportTitle: 'Report' };
            expect(() => {
                addPDFHeader(doc, emptyTranslations, margin);
            }).not.toThrow();
        });
    });

    describe('createCollapsibleResultsSection', () => {
        it('should create collapsible section without throwing', () => {
            const title = 'Test Section';
            const rows = [['Key', 'Value']];

            const section = createCollapsibleResultsSection(title, rows);
            expect(section).toBeDefined();
            expect(section.className).toBe('results-section');
        });

        it('should handle empty title', () => {
            const rows = [['Key', 'Value']];

            const section = createCollapsibleResultsSection('', rows);
            expect(section).toBeDefined();
        });

        it('should handle empty rows', () => {
            const title = 'Test Section';

            const section = createCollapsibleResultsSection(title, []);
            expect(section).toBeDefined();
        });

        it('should handle empty array', () => {
            const title = 'Test Section';

            const section = createCollapsibleResultsSection(title, []);
            expect(section).toBeDefined();
        });
    });

    describe('addRepaymentYear', () => {
        let doc;

        beforeEach(() => {
            // Mock jsPDF for addRepaymentYear
            global.jspdf = {
                jsPDF: jest.fn().mockImplementation(() => ({
                    lastAutoTable: null,
                    text: jest.fn()
                }))
            };
            doc = new global.jspdf.jsPDF();
        });

        afterEach(() => {
            doc = null;
            delete global.jspdf;
        });

        it('should call doc.text with repayment year with pivot', () => {
            const pivot = { years: 5, months: 6, totalMonths: 66 };
            const repaymentYear = 5;

            addRepaymentYear(doc, translations, margin, tableSpacing, repaymentYear, pivot);

            // Check that doc.text was called
            expect(doc.text).toHaveBeenCalled();
        });

        it('should call doc.text with repayment year without pivot', () => {
            const repaymentYear = 5;

            addRepaymentYear(doc, translations, margin, tableSpacing, repaymentYear, null);

            expect(doc.text).toHaveBeenCalled();
        });

        it('should handle zero repayment year', () => {
            const repaymentYear = 0;
            const pivot = { years: 0, months: 0, totalMonths: 0 };

            expect(() => {
                addRepaymentYear(doc, translations, margin, tableSpacing, repaymentYear, pivot);
            }).not.toThrow();
        });

        it('should handle null repaymentYear', () => {
            const pivot = { years: 5, months: 0, totalMonths: 60 };

            expect(() => {
                addRepaymentYear(doc, translations, margin, tableSpacing, null, pivot);
            }).not.toThrow();
        });
    });
});
