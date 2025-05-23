/**
 * @jest-environment jsdom
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initiateLanguageSelection } from '../handle-language.js';
import { loadTranslations, updateContent } from '../handle-language.js';

// Mock loadTranslations et updateContent
jest.mock('../handle-language.js', () => {
    const originalModule = jest.requireActual('../handle-language.js');
    return {
        ...originalModule,
        loadTranslations: jest.fn(() => Promise.resolve({ title: 'Titre' })),
        updateContent: jest.fn()
    };
});

describe('initiateLanguageSelection', () => {

    // let updateContentMock;
    // let loadTranslationsMock;

    beforeEach(() => {
        // Load the index.html file
        const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
        document.body.innerHTML = html;
        // Ajoute un select simulé au DOM
        // document.body.innerHTML = document.getElementById("language-select");

        // Mock loadTranslations and updateContent
        // updateContentMock = jest.fn();
        // loadTranslationsMock = jest.fn().mockResolvedValue({ foo: 'bar' });
        
        // Patch the module functions
        // jest.resetModules();
        // jest.doMock('../handle-language.js', () => {
        //     const original = jest.requireActual('./handle-language.js');
        //     return {
        //         ...original,
        //         loadTranslations: loadTranslationsMock,
        //         updateContent: updateContentMock,
        //     };
        // });
    });

    afterEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });

    it('Detect navigator language if it exists in translations', async () => {
        Object.defineProperty(window.navigator, 'language', { value: 'fr-FR', configurable: true });
        // const { loadTranslations, updateContent } = require('../handle-language.js');

        await initiateLanguageSelection();

        expect(document.getElementById('language-select').value).toBe('fr');
        // TODO check how toHaveBeenCalledWith works
        // expect(loadTranslationsMock).toHaveBeenCalledWith('fr');
        // expect(updateContent).toHaveBeenCalledWith({ title: 'Titre' });
    });

    it('Detect english navigator language', async () => {
        Object.defineProperty(window.navigator, 'language', { value: 'en-EG', configurable: true });
        // const { loadTranslations, updateContent } = require('../handle-language.js');

        await initiateLanguageSelection();

        expect(document.getElementById('language-select').value).toBe('en');
    });

    it('Use default language if navigator language is not in translations', async () => {
        Object.defineProperty(window.navigator, 'language', { value: 'zz-ZZ', configurable: true });
        // const { loadTranslations, updateContent } = require('../handle-language.js');

        await initiateLanguageSelection();

        expect(document.getElementById('language-select').value).toBe('fr');
        // expect(loadTranslations).toHaveBeenCalledWith('fr');
        // expect(updateContent).toHaveBeenCalledWith({ title: 'Titre' });
    });
});