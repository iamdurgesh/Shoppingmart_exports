import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface HomeSolution {
  readonly title: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly imageAlt: string;
}

interface SourcingStep {
  readonly label: string;
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-custom-sourcing-page',
  imports: [RouterLink],
  templateUrl: './custom-sourcing-page.component.html',
  styleUrl: './custom-sourcing-page.component.scss',
})
export class CustomSourcingPageComponent {
  protected readonly homeSolutions: readonly HomeSolution[] = [
    {
      title: 'Floors and surfaces',
      description: 'Ceramic tiles, marble-look finishes, outdoor flooring, wall cladding, and practical material options.',
      imageUrl: '/images/products/tile4.webp',
      imageAlt: 'Modern home kitchen with polished floor and stone finishes',
    },
    {
      title: 'Modular kitchens',
      description: 'Kitchen systems, cabinets, counters, hardware, and finish coordination for apartments or villas.',
      imageUrl: '/images/products/kitchen2.jpeg',
      imageAlt: 'Compact modern modular kitchen with wood counter and white cabinetry',
    },
    {
      title: 'Prayer and heritage spaces',
      description: 'Mandirs, marble temples, idols, brass decor, and traditional pieces selected around your family rituals.',
      imageUrl: '/images/products/temple1.jpg',
      imageAlt: 'White carved home temple displayed against decorative wall finishes',
    },
    {
      title: 'Decor and statement pieces',
      description: 'Antiques, handcrafted decor, feature pieces, doors, partitions, and details that make the home personal.',
      imageUrl: '/images/products/elephant.jpeg',
      imageAlt: 'Golden elephant home decor piece on a display surface',
    },
    {
      title: 'Doors and openings',
      description: 'Glass doors, frames, hardware, partitions, and entrance details aligned with the interior language.',
      imageUrl: '/images/products/door1.jpg',
      imageAlt: 'Modern black framed glass door opened into a bright interior',
    },
    {
      title: 'Outdoor living',
      description: 'Garden, patio, balcony, and terrace finishes that support a complete indoor-outdoor home story.',
      imageUrl: '/images/products/outdoor1.webp',
      imageAlt: 'Outdoor patio seating with plants and flooring finishes',
    },
  ];

  protected readonly sourcingSteps: readonly SourcingStep[] = [
    {
      label: '01',
      title: 'Your home vision',
      description: 'You share rooms, mood references, quantities, destination country, timeline, and budget direction.',
    },
    {
      label: '02',
      title: 'India sourcing desk',
      description: 'We shortlist practical options from Indian suppliers, compare finish quality, packing needs, and export fit.',
    },
    {
      label: '03',
      title: 'Consolidated export plan',
      description: 'Our team coordinates product grouping, shipment planning, documentation, and quotation follow-up.',
    },
    {
      label: '04',
      title: 'Stress-free handover',
      description: 'You receive a clear sourcing path instead of managing many vendors, calls, samples, and freight questions alone.',
    },
  ];
}
