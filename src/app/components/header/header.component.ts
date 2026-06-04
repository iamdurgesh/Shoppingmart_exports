import { DOCUMENT } from '@angular/common';
import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { BrandLogoComponent } from '../brand-logo/brand-logo.component';

interface NavItem {
  readonly label: string;
  readonly routerLink: string;
  readonly fragment?: string;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, BrandLogoComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  protected readonly navItems: readonly NavItem[] = [
    { label: 'Products', routerLink: '/', fragment: 'products' },
    { label: 'Process', routerLink: '/', fragment: 'process' },
    { label: 'Compliance', routerLink: '/compliance' },
    { label: 'Request Quote', routerLink: '/', fragment: 'quote' },
  ];

  protected isMenuOpen = false;
  protected isScrolled = false;

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  ngOnInit(): void {
    this.updateScrolledState();
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    this.updateScrolledState();
  }

  private updateScrolledState(): void {
    this.isScrolled = window.scrollY > 18;
  }

  protected toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.document.body.classList.toggle('nav-open', this.isMenuOpen);
  }

  protected closeMenu(): void {
    this.isMenuOpen = false;
    this.document.body.classList.remove('nav-open');
  }
}
