export type Quality = 'high' | 'medium' | 'low';

type DeviceNavigator = Navigator & {
  deviceMemory?: number;
};

/** Pick a conservative particle budget before the renderer is created. */
export function detectQuality(): Quality {
  if (typeof navigator === 'undefined') return 'medium';

  const device = navigator as DeviceNavigator;
  const memory = device.deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency ?? 4;

  if (memory <= 2 || cores <= 2) return 'low';
  if (memory <= 4 || cores <= 4) return 'medium';
  return 'high';
}

export function canUseWebGL(): boolean {
  if (typeof document === 'undefined') return false;

  let context: WebGL2RenderingContext | null = null;
  try {
    const canvas = document.createElement('canvas');
    // Three.js requires WebGL2; a WebGL1 context cannot render this scene.
    context = canvas.getContext('webgl2');
    return Boolean(context && !context.isContextLost());
  } catch {
    return false;
  } finally {
    // A capability probe should not retain one of the browser's limited contexts.
    try { context?.getExtension('WEBGL_lose_context')?.loseContext(); } catch { /* Already unavailable. */ }
  }
}
