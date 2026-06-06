import { Component } from '@angular/core';

interface ProductCategory {
  readonly number: string;
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-product-categories',
  templateUrl: './product-categories.component.html',
  styleUrl: './product-categories.component.scss',
})
export class ProductCategoriesComponent {
  protected readonly productCategories: readonly ProductCategory[] = [
    {
      number: '01',
      title: 'Consumer Goods',
      description: 'Home, lifestyle, daily-use, and retail-ready products with packaging coordination.',
    },
    {
      number: '02',
      title: 'Food and Staples',
      description: 'Packaged food, grains, spices, and shelf-stable categories with document checks.',
    },
    {
      number: '03',
      title: 'Textiles',
      description: 'Garments, fabrics, and made-ups sourced around samples, sizing, and repeat lots.',
    },
    {
      number: '04',
      title: 'Custom Sourcing',
      description: 'Buyer-led product discovery for private label, bulk purchase, or mixed container needs.',
    },
  ];
}
