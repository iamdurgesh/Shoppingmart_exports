import { Component } from '@angular/core';

import { ComplianceComponent } from '../../components/compliance/compliance.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { IntroComponent } from '../../components/intro/intro.component';
import { ProcessComponent } from '../../components/process/process.component';
import { ProductCategoriesComponent } from '../../components/product-categories/product-categories.component';
import { QuoteFormComponent } from '../../components/quote-form/quote-form.component';

@Component({
  selector: 'app-home-page',
  imports: [
    HeroComponent,
    IntroComponent,
    ProductCategoriesComponent,
    ProcessComponent,
    ComplianceComponent,
    QuoteFormComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {}
