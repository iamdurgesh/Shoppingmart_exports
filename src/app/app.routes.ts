import { Routes } from '@angular/router';

import { CompliancePageComponent } from './pages/compliance-page/compliance-page.component';
import { ContactPageComponent } from './pages/contact-page/contact-page.component';
import { CustomSourcingPageComponent } from './pages/custom-sourcing-page/custom-sourcing-page.component';
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
    component: CompliancePageComponent,
    data: {
      titleKey: 'meta.compliance.title',
      descriptionKey: 'meta.compliance.description',
    },
  },
  {
    path: 'contact',
    component: ContactPageComponent,
    data: {
      titleKey: 'meta.contact.title',
      descriptionKey: 'meta.contact.description',
    },
  },
  { path: 'products/custom-sourcing', component: CustomSourcingPageComponent, title: 'Custom Sourcing | Shoppingmart Exports' },
  { path: '**', redirectTo: '' },
];
