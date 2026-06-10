import { Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { BrandLogoComponent } from '../brand-logo/brand-logo.component';

@Component({
  selector: 'app-footer',
  imports: [BrandLogoComponent, TranslocoPipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {}
