
export interface CsvRow {
  [key: string]: string;
}

export interface ProcessingStatus {
  total: number;
  current: number;
  message: string;
  isComplete: boolean;
  error?: string;
  log?: string[];
}

export interface FileData {
  name: string;
  file: File;
}

export type NamingStrategy = 'default' | 'custom' | 'csv' | 'manual';

export interface NamingConfig {
  strategy: NamingStrategy;
  customBase?: string;
  manualNames?: string;
  startNumber: number;
  padding: number;
  numberLocation: 'prefix' | 'suffix';
  csvColumn?: string;
  csvHasHeader: boolean;
  addNumberToCsv: boolean;
  addNumberToManual: boolean;
}
