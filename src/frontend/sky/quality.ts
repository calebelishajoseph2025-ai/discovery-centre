export type SkyQuality = 'off' | 'css' | 'low' | 'high';

export interface SkyQualityInput {
  reducedMotion: boolean;
  quiet: boolean;
  saveData: boolean;
  hardwareConcurrency: number;
  webgl: boolean;
  hidden: boolean;
  inView: boolean;
}

export function detectWebGL(
  factory: () => WebGLRenderingContext | WebGL2RenderingContext | null = () => {
    if (typeof document === 'undefined') return null;
    try {
      const canvas = document.createElement('canvas');
      return (
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')
      ) as WebGLRenderingContext | null;
    } catch {
      return null;
    }
  }
): boolean {
  return Boolean(factory());
}

export function evaluateSkyQuality(input: SkyQualityInput): SkyQuality {
  if (input.hidden || !input.inView) return 'off';
  if (input.reducedMotion || input.quiet) return 'css';
  if (!input.webgl) return 'css';
  if (input.saveData || input.hardwareConcurrency <= 4) return 'low';
  return 'high';
}

export function readSaveData(
  connection: { saveData?: boolean } | undefined = typeof navigator === 'undefined'
    ? undefined
    : (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
): boolean {
  return Boolean(connection?.saveData);
}

export function readHardwareConcurrency(): number {
  if (typeof navigator === 'undefined') return 8;
  return navigator.hardwareConcurrency || 8;
}
