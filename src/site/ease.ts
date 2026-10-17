export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))

// For scroll-linked motion: no jump where the scroll range starts or ends
export const smoothstep = (t: number) => t * t * (3 - 2 * t)
