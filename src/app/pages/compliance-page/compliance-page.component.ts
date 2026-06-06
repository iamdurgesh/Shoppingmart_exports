import { Component } from '@angular/core';

interface CompliancePillar {
  readonly title: string;
  readonly description: string;
}

interface ReadinessItem {
  readonly label: string;
  readonly details: string;
}

interface SourceLink {
  readonly label: string;
  readonly href: string;
}

interface TradeLocation {
  readonly key: string;
  readonly label: string;
  readonly routeId: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly labelDx: number;
  readonly labelDy: number;
  readonly type: 'hub' | 'primary' | 'region';
}

interface SpherePoint {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

@Component({
  selector: 'app-compliance-page',
  templateUrl: './compliance-page.component.html',
  styleUrl: './compliance-page.component.css',
})
export class CompliancePageComponent {
  private static readonly sphereRadius = 220;
  private static readonly sphereCenter = 280;

  protected showChecklist = false;
  protected globeRotateX = '0deg';
  protected globeRotateY = '0deg';
  protected isGlobeDragging = false;
  private globeRotationX = 0;
  private globeRotationY = 0;

  protected readonly pillars: readonly CompliancePillar[] = [
    {
      title: 'GDPR and DSGVO respect',
      description:
        'We design enquiry flows around data minimization, purpose limitation, access control, and clear buyer communication.',
    },
    {
      title: 'Rules of origin readiness',
      description:
        'Supplier declarations, product origin evidence, HS classification, and invoice records are treated as core export inputs.',
    },
    {
      title: 'EU market documentation',
      description:
        'We prepare product discussions around labelling, safety documentation, SPS needs, technical standards, and importer review.',
    },
    {
      title: 'Responsible trade records',
      description:
        'Commercial invoices, packing lists, certificates, and shipment milestones are structured for repeat orders and auditability.',
    },
  ];

  protected readonly readinessItems: readonly ReadinessItem[] = [
    {
      label: 'FTA status check',
      details:
        'EU-India FTA negotiations concluded on 27 January 2026, but product planning must still respect final legal text, signature, and entry-into-force status.',
    },
    {
      label: 'Product-specific compliance',
      details:
        'Food, textiles, consumer goods, and regulated products can trigger different EU documentation, labelling, safety, or sanitary requirements.',
    },
    {
      label: 'Customs and origin file',
      details:
        'Each order should maintain classification, origin evidence, supplier records, commercial invoice, packing list, and shipment terms.',
    },
    {
      label: 'Data handling',
      details:
        'Buyer and supplier contact details should be collected only when needed and handled under GDPR-minded retention and access practices.',
    },
  ];

  protected readonly sourceLinks: readonly SourceLink[] = [
    {
      label: 'EU-India agreements',
      href: 'https://policy.trade.ec.europa.eu/eu-trade-relationships-country-and-region/countries-and-regions/india/eu-india-agreements_en',
    },
    {
      label: 'Published agreement texts',
      href: 'https://policy.trade.ec.europa.eu/eu-trade-relationships-country-and-region/countries-and-regions/india/eu-india-agreements/text-agreements_en',
    },
    {
      label: 'FTA benefits factsheet',
      href: 'https://policy.trade.ec.europa.eu/eu-trade-relationships-country-and-region/countries-and-regions/india/eu-india-agreements/factsheet-eu-india-free-trade-agreement-main-benefits_en',
    },
  ];

  protected readonly indiaLocation: TradeLocation = {
    key: 'india',
    label: 'India',
    routeId: 'indiaHub',
    latitude: -14,
    longitude: 22,
    labelDx: 24,
    labelDy: 6,
    type: 'hub',
  };

  protected readonly middleEastLocation: TradeLocation = {
    key: 'middle-east',
    label: 'Middle East',
    routeId: 'indiaMiddleEastRoute',
    latitude: 3,
    longitude: -4,
    labelDx: -104,
    labelDy: 6,
    type: 'region',
  };

  protected readonly chinaLocation: TradeLocation = {
    key: 'china',
    label: 'China',
    routeId: 'indiaChinaRoute',
    latitude: 11,
    longitude: 42,
    labelDx: 14,
    labelDy: 6,
    type: 'region',
  };

  protected readonly japanLocation: TradeLocation = {
    key: 'japan',
    label: 'Japan',
    routeId: 'indiaJapanRoute',
    latitude: 19,
    longitude: 64,
    labelDx: 12,
    labelDy: -18,
    type: 'region',
  };

  protected readonly australiaLocation: TradeLocation = {
    key: 'australia',
    label: 'Australia',
    routeId: 'indiaAustraliaRoute',
    latitude: -43,
    longitude: 76,
    labelDx: -120,
    labelDy: 8,
    type: 'region',
  };

  protected readonly europeLocation: TradeLocation = {
    key: 'europe',
    label: 'Europe',
    routeId: 'indiaEuropeRoute',
    latitude: 28,
    longitude: -36,
    labelDx: -84,
    labelDy: 6,
    type: 'primary',
  };

  protected readonly regionalLocations: readonly TradeLocation[] = [
    this.middleEastLocation,
    this.chinaLocation,
    this.japanLocation,
    this.australiaLocation,
  ];

  protected readonly shipRouteLocations: readonly TradeLocation[] = [
    this.middleEastLocation,
    this.chinaLocation,
    this.japanLocation,
    this.australiaLocation,
    this.europeLocation,
  ];
  protected readonly globeLatitudes: readonly number[] = [-60, -30, 0, 30, 60];
  protected readonly globeLongitudes: readonly number[] = [-120, -75, -30, 15, 60, 105, 150];

  protected toggleChecklist(): void {
    this.showChecklist = !this.showChecklist;
  }

  protected startGlobeDrag(event: PointerEvent): void {
    const target = event.currentTarget;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    this.isGlobeDragging = true;
    target.setPointerCapture(event.pointerId);
    this.setGlobeRotation(event, target);
  }

  protected updateGlobeRotation(event: PointerEvent): void {
    const target = event.currentTarget;

    if (!this.isGlobeDragging || !(target instanceof HTMLElement)) {
      return;
    }

    this.setGlobeRotation(event, target);
  }

  protected endGlobeDrag(event: PointerEvent): void {
    const target = event.currentTarget;

    if (target instanceof HTMLElement && target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }

    this.isGlobeDragging = false;
  }

  protected resetGlobeRotation(): void {
    this.globeRotationX = 0;
    this.globeRotationY = 0;
    this.syncGlobeCssRotation();
  }

  protected projectedPoint(location: TradeLocation): SpherePoint {
    return this.projectVector(this.locationToVector(location));
  }

  protected routePath(destination: TradeLocation): string {
    const origin = this.locationToVector(this.indiaLocation);
    const target = this.locationToVector(destination);
    const points = Array.from({ length: 16 }, (_, index) => {
      const projected = this.projectVector(this.slerp(origin, target, index / 15));
      return `${projected.x.toFixed(1)} ${projected.y.toFixed(1)}`;
    });

    return `M${points.join(' L')}`;
  }

  protected pointOpacity(location: TradeLocation): number {
    return this.depthOpacity(this.projectedPoint(location).z);
  }

  protected routeOpacity(destination: TradeLocation): number {
    const originDepth = this.projectedPoint(this.indiaLocation).z;
    const destinationDepth = this.projectedPoint(destination).z;

    return this.depthOpacity(Math.min(originDepth, destinationDepth));
  }

  protected latitudePath(latitude: number): string {
    const points = Array.from({ length: 49 }, (_, index) => {
      const longitude = -180 + index * 7.5;
      const projected = this.projectVector(this.vectorFromLatLon(latitude, longitude));
      return `${projected.x.toFixed(1)} ${projected.y.toFixed(1)}`;
    });

    return `M${points.join(' L')}`;
  }

  protected longitudePath(longitude: number): string {
    const points = Array.from({ length: 33 }, (_, index) => {
      const latitude = -80 + index * 5;
      const projected = this.projectVector(this.vectorFromLatLon(latitude, longitude));
      return `${projected.x.toFixed(1)} ${projected.y.toFixed(1)}`;
    });

    return `M${points.join(' L')}`;
  }

  private setGlobeRotation(event: PointerEvent, target: HTMLElement): void {
    const rect = target.getBoundingClientRect();
    const horizontal = (event.clientX - rect.left) / rect.width - 0.5;
    const vertical = (event.clientY - rect.top) / rect.height - 0.5;

    this.globeRotationX = -vertical * 70;
    this.globeRotationY = horizontal * 120;
    this.syncGlobeCssRotation();
  }

  private syncGlobeCssRotation(): void {
    this.globeRotateX = `${this.globeRotationX.toFixed(2)}deg`;
    this.globeRotateY = `${this.globeRotationY.toFixed(2)}deg`;
  }

  private locationToVector(location: TradeLocation): SpherePoint {
    return this.vectorFromLatLon(location.latitude, location.longitude);
  }

  private vectorFromLatLon(latitudeDegrees: number, longitudeDegrees: number): SpherePoint {
    const latitude = this.toRadians(latitudeDegrees);
    const longitude = this.toRadians(longitudeDegrees);
    const cosLatitude = Math.cos(latitude);

    return {
      x: cosLatitude * Math.sin(longitude),
      y: Math.sin(latitude),
      z: cosLatitude * Math.cos(longitude),
    };
  }

  private projectVector(vector: SpherePoint): SpherePoint {
    const yaw = this.toRadians(this.globeRotationY);
    const pitch = this.toRadians(this.globeRotationX);
    const yawedX = vector.x * Math.cos(yaw) + vector.z * Math.sin(yaw);
    const yawedZ = -vector.x * Math.sin(yaw) + vector.z * Math.cos(yaw);
    const pitchedY = vector.y * Math.cos(pitch) - yawedZ * Math.sin(pitch);
    const pitchedZ = vector.y * Math.sin(pitch) + yawedZ * Math.cos(pitch);

    return {
      x: CompliancePageComponent.sphereCenter + yawedX * CompliancePageComponent.sphereRadius,
      y: CompliancePageComponent.sphereCenter - pitchedY * CompliancePageComponent.sphereRadius,
      z: pitchedZ,
    };
  }

  private slerp(from: SpherePoint, to: SpherePoint, amount: number): SpherePoint {
    const dot = Math.max(-1, Math.min(1, from.x * to.x + from.y * to.y + from.z * to.z));
    const theta = Math.acos(dot);

    if (theta < 0.0001) {
      return from;
    }

    const sinTheta = Math.sin(theta);
    const fromScale = Math.sin((1 - amount) * theta) / sinTheta;
    const toScale = Math.sin(amount * theta) / sinTheta;

    return {
      x: from.x * fromScale + to.x * toScale,
      y: from.y * fromScale + to.y * toScale,
      z: from.z * fromScale + to.z * toScale,
    };
  }

  private depthOpacity(depth: number): number {
    return Math.max(0.18, Math.min(1, 0.45 + depth * 0.55));
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
