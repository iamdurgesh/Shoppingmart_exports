import { PrerenderFallback, RenderMode, type ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    async getPrerenderParams() {
      return [
        { '**': '' },
        { '**': 'compliance' },
        { '**': 'contact' },
        { '**': 'privacy-policy' },
        { '**': 'products/custom-sourcing' },
      ];
    },
  },
];
