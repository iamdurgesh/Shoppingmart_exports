import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslocoService } from '@jsverse/transloco';
import { filter, merge, startWith, switchMap, take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SeoI18nService {
  private static readonly siteOrigin = 'https://shoppingmartexports.com';

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly translocoService = inject(TranslocoService);
  private hasStarted = false;

  start(): void {
    if (this.hasStarted) {
      return;
    }

    this.hasStarted = true;

    merge(
      this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)),
      this.translocoService.langChanges$,
    )
      .pipe(
        startWith(null),
        switchMap(() => this.translocoService.load(this.translocoService.getActiveLang()).pipe(take(1))),
      )
      .subscribe(() => this.updateMeta());
  }

  private updateMeta(): void {
    const snapshot = this.getDeepestSnapshot(this.activatedRoute.snapshot);
    const titleKey = this.readRouteData(snapshot, 'titleKey');
    const descriptionKey = this.readRouteData(snapshot, 'descriptionKey');

    const pageTitle = titleKey ? this.translocoService.translate(titleKey) : '';
    const pageDescription = descriptionKey ? this.translocoService.translate(descriptionKey) : '';
    const canonicalUrl = this.getCanonicalUrl();

    if (pageTitle) {
      this.title.setTitle(pageTitle);
      this.updatePropertyMeta('og:title', pageTitle);
      this.updateNamedMeta('twitter:title', pageTitle);
    }

    if (pageDescription) {
      this.updateNamedMeta('description', pageDescription);
      this.updatePropertyMeta('og:description', pageDescription);
      this.updateNamedMeta('twitter:description', pageDescription);
    }

    this.updatePropertyMeta('og:url', canonicalUrl);
    this.updatePropertyMeta('og:locale', this.getOpenGraphLocale());
    this.updateCanonicalLink(canonicalUrl);
  }

  private getCanonicalUrl(): string {
    const routePath = this.router.url.split(/[?#]/, 1)[0];
    const normalizedPath = routePath === '/' ? '/' : routePath.replace(/\/$/, '');

    return `${SeoI18nService.siteOrigin}${normalizedPath}`;
  }

  private getOpenGraphLocale(): string {
    const localeByLanguage: Readonly<Record<string, string>> = {
      de: 'de_DE',
      en: 'en_GB',
      fr: 'fr_FR',
    };

    return localeByLanguage[this.translocoService.getActiveLang()] ?? localeByLanguage['en'];
  }

  private updateNamedMeta(name: string, content: string): void {
    this.meta.updateTag({ name, content });
  }

  private updatePropertyMeta(property: string, content: string): void {
    this.meta.updateTag({ property, content }, `property='${property}'`);
  }

  private updateCanonicalLink(url: string): void {
    let canonicalLink = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!canonicalLink) {
      canonicalLink = this.document.createElement('link');
      canonicalLink.rel = 'canonical';
      this.document.head.append(canonicalLink);
    }

    canonicalLink.href = url;
  }

  private getDeepestSnapshot(snapshot: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    let currentSnapshot = snapshot;

    while (currentSnapshot.firstChild) {
      currentSnapshot = currentSnapshot.firstChild;
    }

    return currentSnapshot;
  }

  private readRouteData(snapshot: ActivatedRouteSnapshot, key: string): string | null {
    const value = snapshot.data[key];
    return typeof value === 'string' ? value : null;
  }
}
