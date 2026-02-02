// Design System Types

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600?: string;
  700?: string;
  800?: string;
  900?: string;
}

export interface SemanticTokens {
  primary: string;
  'primary-foreground': string;
  'primary-glow': string;
  'primary-subtle': string;
  secondary: string;
  'secondary-foreground': string;
  'secondary-glow': string;
  accent: string;
  'accent-foreground': string;
  background: string;
  foreground: string;
  card: string;
  'card-foreground': string;
  muted: string;
  'muted-foreground': string;
  success: string;
  'success-foreground': string;
  warning: string;
  'warning-foreground': string;
  destructive: string;
  'destructive-foreground': string;
  border: string;
  input: string;
  ring: string;
}

export interface NeumorphicShadows {
  light: string;
  dark: string;
  combined: string;
  hover: string;
  inset: string;
  pressed: string;
}

export interface ColorVariables {
  semantic: SemanticTokens;
  palettes: {
    navy: ColorPalette;
    golden: ColorPalette;
    coral: ColorPalette;
    cream: ColorPalette;
  };
  gradients: Record<string, string>;
  shadows: Record<string, string>;
  neumorphicShadows?: NeumorphicShadows;
  neumorphicSurface?: string;
  elementOverrides?: Record<string, string>;
}

export interface DesignSystemConfig {
  id: string;
  user_id: string | null;
  theme_name: string;
  is_active: boolean;
  color_variables: ColorVariables;
  created_at: string;
  updated_at: string;
}

export interface DesignSystemHistory {
  id: string;
  config_id: string;
  user_id: string | null;
  changed_element: string;
  changes_made: Record<string, any>;
  score_before: number | null;
  score_after: number | null;
  created_at: string;
}

export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export interface ColorEditorState {
  palette: 'navy' | 'golden' | 'coral' | 'cream';
  shade: string;
  value: string;
}
