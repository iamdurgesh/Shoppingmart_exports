import { Component } from '@angular/core';

import { BrandLogoComponent } from '../brand-logo/brand-logo.component';

@Component({
  selector: 'app-footer',
  imports: [BrandLogoComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {}
