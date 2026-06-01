import { Routes } from '@angular/router';

import { CompliancePageComponent } from './pages/compliance-page/compliance-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent, title: 'Shoppingmart Exports | Global Sourcing Platform' },
  { path: 'compliance', component: CompliancePageComponent, title: 'Compliance | Shoppingmart Exports' },
  { path: '**', redirectTo: '' },
];
