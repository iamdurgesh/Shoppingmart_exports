import { Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

interface ProcessStep {
  readonly number: string;
  readonly titleKey: string;
  readonly descriptionKey: string;
}

@Component({
  selector: 'app-process',
  imports: [TranslocoPipe],
  templateUrl: './process.component.html',
  styleUrl: './process.component.scss',
})
export class ProcessComponent {
  protected readonly steps: readonly ProcessStep[] = [
    {
      number: '1',
      titleKey: 'process.steps.requirements.title',
      descriptionKey: 'process.steps.requirements.description',
    },
    {
      number: '2',
      titleKey: 'process.steps.supplier.title',
      descriptionKey: 'process.steps.supplier.description',
    },
    {
      number: '3',
      titleKey: 'process.steps.export.title',
      descriptionKey: 'process.steps.export.description',
    },
  ];
}
