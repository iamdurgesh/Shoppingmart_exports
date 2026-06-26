import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Injectable } from '@angular/core';
import { TranslocoLoader, type Translation } from '@jsverse/transloco';

import { isSupportedLanguage } from './i18n.constants';

@Injectable()
export class TranslocoServerLoader implements TranslocoLoader {
  async getTranslation(language: string): Promise<Translation> {
    if (!isSupportedLanguage(language)) {
      throw new Error(`Unsupported translation language: ${language}`);
    }

    const translationPath = resolve(process.cwd(), 'public', 'assets', 'i18n', `${language}.json`);
    const translationJson = await readFile(translationPath, 'utf8');

    return JSON.parse(translationJson) as Translation;
  }
}
