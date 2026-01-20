/**
 * @jest-environment jsdom
 */
import { loadTranslations } from '../js/handle-language';

describe('loadTranslations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should load and parse translations from JSON file', async () => {
        const mockTranslations = {
            title: 'Test Title',
            price: 'Test Price'
        };

        global.fetch.mockResolvedValue({
            json: () => Promise.resolve(mockTranslations)
        });

        const result = await loadTranslations('en');
        
        expect(global.fetch).toHaveBeenCalledWith('translations/en.json');
        expect(result).toEqual(mockTranslations);
    });

    it('should load French translations', async () => {
        const mockTranslations = {
            title: 'Titre',
            prix: 'Prix'
        };

        global.fetch.mockResolvedValue({
            json: () => Promise.resolve(mockTranslations)
        });

        const result = await loadTranslations('fr');
        
        expect(global.fetch).toHaveBeenCalledWith('translations/fr.json');
        expect(result).toEqual(mockTranslations);
    });

    it('should handle fetch errors and return null', async () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        
        global.fetch.mockRejectedValue(new Error('Network error'));

        const result = await loadTranslations('en');
        
        expect(result).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledWith('Error loading translations:', expect.any(Error));
        
        consoleWarnSpy.mockRestore();
    });

    it('should handle invalid JSON response', async () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        
        global.fetch.mockResolvedValue({
            json: () => Promise.reject(new Error('Invalid JSON'))
        });

        const result = await loadTranslations('en');
        
        expect(result).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledWith('Error loading translations:', expect.any(Error));
        
        consoleWarnSpy.mockRestore();
    });
});
