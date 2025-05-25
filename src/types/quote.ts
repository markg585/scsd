// src/types/quote.ts

export type PhaseType = 'Preparation' | 'Seal' | 'Asphalt';

export interface LabourQuoteLine {
  labourId: string;
  quantity: number;
  chargeRate: number;
  total: number;
  requiredFor: PhaseType;
  isNight: boolean;
}

export interface EquipmentQuoteLine {
  equipmentId: string;
  quantity: number;
  chargeRate: number;
  total: number;
  requiredFor: PhaseType;
  isNight: boolean;
}

export interface MaterialQuoteLine {
  materialId: string;
  materialType: string;
  sqm: number;
  depth: number;
  quantity: number;
  sellPrice: number;
  charge: number;
}
