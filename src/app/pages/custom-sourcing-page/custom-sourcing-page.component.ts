import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

interface HomeSolution {
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly imageUrl: string;
  readonly imageAltKey: string;
}

interface SourcingStep {
  readonly label: string;
  readonly titleKey: string;
  readonly descriptionKey: string;
}

@Component({
  selector: 'app-custom-sourcing-page',
  imports: [RouterLink, TranslocoPipe],
  templateUrl: './custom-sourcing-page.component.html',
  styleUrl: './custom-sourcing-page.component.scss',
})
export class CustomSourcingPageComponent {
  protected readonly homeSolutions: readonly HomeSolution[] = [
    {
      titleKey: 'customSourcingPage.solutions.items.surfaces.title',
      descriptionKey: 'customSourcingPage.solutions.items.surfaces.description',
      imageUrl: '/images/products/outdoor-view.jpg',
      imageAltKey: 'customSourcingPage.solutions.items.surfaces.imageAlt',
    },
    {
      titleKey: 'customSourcingPage.solutions.items.kitchens.title',
      descriptionKey: 'customSourcingPage.solutions.items.kitchens.description',
      imageUrl: '/images/products/kitchen2.jpeg',
      imageAltKey: 'customSourcingPage.solutions.items.kitchens.imageAlt',
    },
    {
      titleKey: 'customSourcingPage.solutions.items.heritage.title',
      descriptionKey: 'customSourcingPage.solutions.items.heritage.description',
      imageUrl: '/images/products/temple1.jpg',
      imageAltKey: 'customSourcingPage.solutions.items.heritage.imageAlt',
    },
    {
      titleKey: 'customSourcingPage.solutions.items.decor.title',
      descriptionKey: 'customSourcingPage.solutions.items.decor.description',
      imageUrl: '/images/products/elephant.jpeg',
      imageAltKey: 'customSourcingPage.solutions.items.decor.imageAlt',
    },
    {
      titleKey: 'customSourcingPage.solutions.items.doors.title',
      descriptionKey: 'customSourcingPage.solutions.items.doors.description',
      imageUrl: '/images/products/door1.jpg',
      imageAltKey: 'customSourcingPage.solutions.items.doors.imageAlt',
    },
    {
      titleKey: 'customSourcingPage.solutions.items.outdoor.title',
      descriptionKey: 'customSourcingPage.solutions.items.outdoor.description',
      imageUrl: '/images/products/outdoor-view.jpg',
      imageAltKey: 'customSourcingPage.solutions.items.outdoor.imageAlt',
    },
  ];

  protected readonly sourcingSteps: readonly SourcingStep[] = [
    {
      label: '01',
      titleKey: 'customSourcingPage.steps.items.vision.title',
      descriptionKey: 'customSourcingPage.steps.items.vision.description',
    },
    {
      label: '02',
      titleKey: 'customSourcingPage.steps.items.desk.title',
      descriptionKey: 'customSourcingPage.steps.items.desk.description',
    },
    {
      label: '03',
      titleKey: 'customSourcingPage.steps.items.plan.title',
      descriptionKey: 'customSourcingPage.steps.items.plan.description',
    },
    {
      label: '04',
      titleKey: 'customSourcingPage.steps.items.handover.title',
      descriptionKey: 'customSourcingPage.steps.items.handover.description',
    },
  ];
}
