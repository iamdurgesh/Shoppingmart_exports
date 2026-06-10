import { Injectable } from '@angular/core';

export interface OptionItem<TValue extends string = string> {
  readonly value: TValue;
  readonly labelKey: string;
}

export const MARKETS = [
  'European Union',
  'United Kingdom',
  'Middle East',
  'North America',
  'Other market',
] as const;

export const CATEGORIES = [
  'Consumer Goods',
  'Food and Staples',
  'Textiles',
  'Custom Sourcing',
] as const;

export type Market = (typeof MARKETS)[number];
export type Category = (typeof CATEGORIES)[number];
export type Volume = 'sample' | 'pallet' | 'container' | 'mixed';

export const MARKET_OPTIONS: readonly OptionItem<Market>[] = [
  { value: 'European Union', labelKey: 'quote.options.markets.europeanUnion' },
  { value: 'United Kingdom', labelKey: 'quote.options.markets.unitedKingdom' },
  { value: 'Middle East', labelKey: 'quote.options.markets.middleEast' },
  { value: 'North America', labelKey: 'quote.options.markets.northAmerica' },
  { value: 'Other market', labelKey: 'quote.options.markets.otherMarket' },
];

export const CATEGORY_OPTIONS: readonly OptionItem<Category>[] = [
  { value: 'Consumer Goods', labelKey: 'quote.options.categories.consumerGoods' },
  { value: 'Food and Staples', labelKey: 'quote.options.categories.foodStaples' },
  { value: 'Textiles', labelKey: 'quote.options.categories.textiles' },
  { value: 'Custom Sourcing', labelKey: 'quote.options.categories.customSourcing' },
];

export const VOLUME_OPTIONS: readonly OptionItem<Volume>[] = [
  { value: 'sample', labelKey: 'quote.options.volumes.sample' },
  { value: 'pallet', labelKey: 'quote.options.volumes.pallet' },
  { value: 'container', labelKey: 'quote.options.volumes.container' },
  { value: 'mixed', labelKey: 'quote.options.volumes.mixed' },
];

const VOLUME_PAYLOAD_LABELS: Record<Volume, string> = {
  sample: 'Samples or trial order',
  pallet: 'Pallet-level order',
  container: 'Container load',
  mixed: 'Mixed product shipment',
};

export interface QuoteEnquiryDraft {
  readonly name: string;
  readonly email: string;
  readonly company: string;
  readonly contactDetails: string;
  readonly market: Market;
  readonly category: Category;
  readonly volume: Volume;
  readonly message: string;
  readonly privacyAccepted: boolean;
}

export interface QuoteDraftSnapshot {
  readonly draft: QuoteEnquiryDraft;
  readonly savedAt: string | null;
}

export interface QuoteRequestPayload {
  readonly requestId: string;
  readonly schemaVersion: 'quote-request.v1';
  readonly submittedAt: string;
  readonly source: 'website-quote-form';
  readonly status: 'queued';
  readonly contact: {
    readonly fullName: string;
    readonly email: string;
    readonly companyName: string | null;
    readonly preferredContact: string | null;
  };
  readonly trade: {
    readonly destinationMarket: Market;
    readonly productCategory: Category;
    readonly shipmentSize: {
      readonly code: Volume;
      readonly label: string;
    };
  };
  readonly enquiry: {
    readonly message: string;
  };
  readonly consent: {
    readonly quotationFollowUpAccepted: boolean;
    readonly purpose: 'quotation-follow-up';
  };
  readonly metadata: {
    readonly locale: string;
    readonly userAgent: string | null;
  };
}

export interface QuoteSubmissionRecord {
  readonly payload: QuoteRequestPayload;
  readonly savedAt: string;
  readonly source: 'website-quote-form';
  readonly status: 'queued';
}

@Injectable({ providedIn: 'root' })
export class QuoteEnquiryService {
  readonly salesEmail = 'global.sales@shoppingmartexports.com';
  readonly markets = MARKETS;
  readonly categories = CATEGORIES;
  readonly marketOptions = MARKET_OPTIONS;
  readonly categoryOptions = CATEGORY_OPTIONS;
  readonly volumeOptions = VOLUME_OPTIONS;
  readonly volumes = VOLUME_OPTIONS;

  private readonly draftStorageKey = 'shoppingmart-exports.quote-enquiry.draft';
  private readonly submissionStorageKey = 'shoppingmart-exports.quote-enquiry.queue';

  createDefaultDraft(): QuoteEnquiryDraft {
    return {
      name: '',
      email: '',
      company: '',
      contactDetails: '',
      market: 'European Union',
      category: 'Consumer Goods',
      volume: 'sample',
      message: '',
      privacyAccepted: false,
    };
  }

  loadDraftSnapshot(): QuoteDraftSnapshot {
    const fallback: QuoteDraftSnapshot = {
      draft: this.createDefaultDraft(),
      savedAt: null,
    };

    const snapshot = this.readJson<unknown>(this.draftStorageKey);

    if (!snapshot || !this.isRecord(snapshot)) {
      return fallback;
    }

    return {
      draft: this.sanitizeDraft(snapshot['draft']),
      savedAt: this.readString(snapshot['savedAt']),
    };
  }

  persistDraft(draft: QuoteEnquiryDraft): QuoteDraftSnapshot {
    const snapshot: QuoteDraftSnapshot = {
      draft: this.sanitizeDraft(draft),
      savedAt: new Date().toISOString(),
    };

    this.writeJson(this.draftStorageKey, snapshot);
    return snapshot;
  }

  queueSubmission(draft: QuoteEnquiryDraft): QuoteSubmissionRecord {
    const submittedAt = new Date().toISOString();
    const payload = this.buildQuoteRequestPayload(draft, submittedAt);
    const submission: QuoteSubmissionRecord = {
      payload,
      savedAt: submittedAt,
      source: 'website-quote-form',
      status: 'queued',
    };

    const queued = this.readQueuedSubmissions();
    queued.push(submission);

    // This boundary can later be swapped with an HTTP repository without changing the form component.
    this.writeJson(this.submissionStorageKey, queued);
    this.writeJson(this.draftStorageKey, {
      draft: this.sanitizeDraft(draft),
      savedAt: submission.savedAt,
    } satisfies QuoteDraftSnapshot);

    return submission;
  }

  buildQuoteRequestPayload(draft: QuoteEnquiryDraft, submittedAt = new Date().toISOString()): QuoteRequestPayload {
    const sanitized = this.sanitizeDraft(draft);
    const shipmentSizeLabel = this.getShipmentSizeLabel(sanitized.volume);

    return {
      requestId: this.createRequestId(),
      schemaVersion: 'quote-request.v1',
      submittedAt,
      source: 'website-quote-form',
      status: 'queued',
      contact: {
        fullName: sanitized.name,
        email: sanitized.email,
        companyName: this.nullIfEmpty(sanitized.company),
        preferredContact: this.nullIfEmpty(sanitized.contactDetails),
      },
      trade: {
        destinationMarket: sanitized.market,
        productCategory: sanitized.category,
        shipmentSize: {
          code: sanitized.volume,
          label: shipmentSizeLabel,
        },
      },
      enquiry: {
        message: sanitized.message,
      },
      consent: {
        quotationFollowUpAccepted: sanitized.privacyAccepted,
        purpose: 'quotation-follow-up',
      },
      metadata: {
        locale: globalThis.navigator?.language ?? 'en',
        userAgent: globalThis.navigator?.userAgent ?? null,
      },
    };
  }

  private readQueuedSubmissions(): QuoteSubmissionRecord[] {
    const queued = this.readJson<unknown>(this.submissionStorageKey);

    if (!Array.isArray(queued)) {
      return [];
    }

    return queued
      .filter((entry): entry is Record<string, unknown> => this.isRecord(entry))
      .map((entry) => this.sanitizeSubmissionRecord(entry));
  }

  private sanitizeSubmissionRecord(entry: Record<string, unknown>): QuoteSubmissionRecord {
    const savedAt = this.readString(entry['savedAt']) ?? new Date().toISOString();
    const payload = this.isRecord(entry['payload'])
      ? this.sanitizePayload(entry['payload'], savedAt)
      : this.buildQuoteRequestPayload(this.sanitizeDraft(entry['enquiry']), savedAt);

    return {
      payload,
      savedAt,
      source: 'website-quote-form',
      status: 'queued',
    };
  }

  private sanitizePayload(value: Record<string, unknown>, fallbackSubmittedAt: string): QuoteRequestPayload {
    const fallback = this.buildQuoteRequestPayload(this.createDefaultDraft(), fallbackSubmittedAt);
    const contact = this.isRecord(value['contact']) ? value['contact'] : {};
    const trade = this.isRecord(value['trade']) ? value['trade'] : {};
    const shipmentSize = this.isRecord(trade['shipmentSize']) ? trade['shipmentSize'] : {};
    const enquiry = this.isRecord(value['enquiry']) ? value['enquiry'] : {};
    const consent = this.isRecord(value['consent']) ? value['consent'] : {};
    const metadata = this.isRecord(value['metadata']) ? value['metadata'] : {};
    const volume = this.readEnum(shipmentSize['code'], this.volumes.map((item) => item.value), fallback.trade.shipmentSize.code);

    return {
      requestId: this.readString(value['requestId']) ?? fallback.requestId,
      schemaVersion: 'quote-request.v1',
      submittedAt: this.readString(value['submittedAt']) ?? fallbackSubmittedAt,
      source: 'website-quote-form',
      status: 'queued',
      contact: {
        fullName: this.readString(contact['fullName']) ?? fallback.contact.fullName,
        email: this.readString(contact['email']) ?? fallback.contact.email,
        companyName: this.readNullableString(contact['companyName']),
        preferredContact: this.readNullableString(contact['preferredContact']),
      },
      trade: {
        destinationMarket: this.readEnum(trade['destinationMarket'], this.markets, fallback.trade.destinationMarket),
        productCategory: this.readEnum(trade['productCategory'], this.categories, fallback.trade.productCategory),
        shipmentSize: {
          code: volume,
          label: this.readString(shipmentSize['label']) ?? this.getShipmentSizeLabel(volume),
        },
      },
      enquiry: {
        message: this.readString(enquiry['message']) ?? fallback.enquiry.message,
      },
      consent: {
        quotationFollowUpAccepted:
          typeof consent['quotationFollowUpAccepted'] === 'boolean'
            ? consent['quotationFollowUpAccepted']
            : fallback.consent.quotationFollowUpAccepted,
        purpose: 'quotation-follow-up',
      },
      metadata: {
        locale: this.readString(metadata['locale']) ?? fallback.metadata.locale,
        userAgent: this.readNullableString(metadata['userAgent']),
      },
    };
  }

  private sanitizeDraft(value: unknown): QuoteEnquiryDraft {
    const candidate = this.isRecord(value) ? value : {};
    const fallback = this.createDefaultDraft();

    return {
      name: this.readString(candidate['name']) ?? fallback.name,
      email: this.readString(candidate['email']) ?? fallback.email,
      company: this.readString(candidate['company']) ?? fallback.company,
      contactDetails: this.readString(candidate['contactDetails']) ?? fallback.contactDetails,
      market: this.readEnum(candidate['market'], this.markets, fallback.market),
      category: this.readEnum(candidate['category'], this.categories, fallback.category),
      volume: this.readEnum(
        candidate['volume'],
        this.volumes.map((volume) => volume.value),
        fallback.volume,
      ),
      message: this.readString(candidate['message']) ?? fallback.message,
      privacyAccepted: this.readBoolean(candidate['privacyAccepted']) ?? fallback.privacyAccepted,
    };
  }

  private getShipmentSizeLabel(volume: Volume): string {
    return VOLUME_PAYLOAD_LABELS[volume] ?? 'Shipment planning';
  }

  private createRequestId(): string {
    return globalThis.crypto?.randomUUID?.() ?? `quote_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  private nullIfEmpty(value: string): string | null {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  private readJson<TValue>(key: string): TValue | null {
    try {
      const raw = globalThis.localStorage?.getItem(key);
      return raw ? (JSON.parse(raw) as TValue) : null;
    } catch {
      return null;
    }
  }

  private writeJson(key: string, value: unknown): void {
    try {
      globalThis.localStorage?.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage errors and keep the form functional.
    }
  }

  private readString(value: unknown): string | null {
    return typeof value === 'string' ? value : null;
  }

  private readNullableString(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value : null;
  }

  private readBoolean(value: unknown): boolean | null {
    return typeof value === 'boolean' ? value : null;
  }

  private readEnum<TValue extends string>(
    value: unknown,
    allowed: readonly TValue[],
    fallback: TValue,
  ): TValue {
    return typeof value === 'string' && allowed.includes(value as TValue) ? (value as TValue) : fallback;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
