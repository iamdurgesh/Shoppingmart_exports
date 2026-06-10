import { Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-brand-logo',
  imports: [TranslocoPipe],
  templateUrl: './brand-logo.component.html',
  styleUrl: './brand-logo.component.scss',
})
export class BrandLogoComponent {
  readonly background = input<'light' | 'dark'>('light');
}
