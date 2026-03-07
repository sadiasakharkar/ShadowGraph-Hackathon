export const palette = {
  bg: '#020409',
  navy: '#060b17',
  electric: '#0a1a3a',
  pink: '#ff4fa3',
  purple: '#7a5cff',
  cyan: '#2ee6ff',
  red: '#ff3b5f',
  blue: '#4da8ff'
};

export type ShadowNodeType = 'identity' | 'account' | 'domain' | 'threat';

export function nodeColorByType(type: ShadowNodeType): string {
  switch (type) {
    case 'identity':
      return palette.blue;
    case 'account':
      return palette.pink;
    case 'domain':
      return palette.purple;
    case 'threat':
      return palette.red;
    default:
      return palette.cyan;
  }
}
