import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslocoService } from '@jsverse/transloco';
import { filter, merge, startWith, switchMap, take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SeoI18nService {
  private readonly activatedRoute = inject(ActivatedRoute);
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

    if (titleKey) {
      this.title.setTitle(this.translocoService.translate(titleKey) ?? '');
    }

    if (descriptionKey) {
      this.meta.updateTag({
        name: 'description',
        content: this.translocoService.translate(descriptionKey) ?? '',
      });
    }
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
