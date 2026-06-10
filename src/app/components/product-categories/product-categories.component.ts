import { Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

interface ProductCategory {
  readonly number: string;
  readonly titleKey: string;
  readonly descriptionKey: string;
}

@Component({
  selector: 'app-product-categories',
  imports: [TranslocoPipe],
  templateUrl: './product-categories.component.html',
  styleUrl: './product-categories.component.scss',
})
export class ProductCategoriesComponent {
  protected readonly productCategories: readonly ProductCategory[] = [
    {
      number: '01',
      titleKey: 'products.cards.consumerGoods.title',
      descriptionKey: 'products.cards.consumerGoods.description',
    },
    {
      number: '02',
      titleKey: 'products.cards.foodStaples.title',
      descriptionKey: 'products.cards.foodStaples.description',
    },
    {
      number: '03',
      titleKey: 'products.cards.textiles.title',
      descriptionKey: 'products.cards.textiles.description',
    },
    {
      number: '04',
      titleKey: 'products.cards.customSourcing.title',
      descriptionKey: 'products.cards.customSourcing.description',
    },
  ];
}
