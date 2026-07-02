import { Routes } from '@angular/router';

import { HomePageComponent } from './pages/home-page/home-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    data: {
      titleKey: 'meta.home.title',
      descriptionKey: 'meta.home.description',
    },
  },
  {
    path: 'compliance',
    loadComponent: () =>
      import('./pages/compliance-page/compliance-page.component').then(
        (m) => m.CompliancePageComponent,
      ),
    data: {
      titleKey: 'meta.compliance.title',
      descriptionKey: 'meta.compliance.description',
    },
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact-page/contact-page.component').then(
        (m) => m.ContactPageComponent,
      ),
    data: {
      titleKey: 'meta.contact.title',
      descriptionKey: 'meta.contact.description',
    },
  },
  {
    path: 'products/custom-sourcing',
    loadComponent: () =>
      import('./pages/custom-sourcing-page/custom-sourcing-page.component').then(
        (m) => m.CustomSourcingPageComponent,
      ),
    data: {
      titleKey: 'meta.customSourcing.title',
      descriptionKey: 'meta.customSourcing.description',
    },
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./pages/privacy-policy-page/privacy-policy-page.component').then(
        (m) => m.PrivacyPolicyPageComponent,
      ),
    data: {
      titleKey: 'meta.privacyPolicy.title',
      descriptionKey: 'meta.privacyPolicy.description',
    },
  },
  { path: '**', redirectTo: '' },
];
