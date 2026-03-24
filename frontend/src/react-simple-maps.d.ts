declare module "react-simple-maps" {
  import { ComponentType, CSSProperties, ReactNode } from "react";

  interface ProjectionConfig {
    rotate?: [number, number, number];
    scale?: number;
    center?: [number, number];
  }

  interface ComposableMapProps {
    projectionConfig?: ProjectionConfig;
    width?: number;
    height?: number;
    style?: CSSProperties;
    children?: ReactNode;
  }

  interface GeographyStyleProps {
    default?: CSSProperties;
    hover?: CSSProperties;
    pressed?: CSSProperties;
  }

  interface GeographyProps {
    geography: Record<string, unknown>;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseMove?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
    style?: GeographyStyleProps;
  }

  interface GeographiesChildrenArgs {
    geographies: Array<{
      rsmKey: string;
      properties: Record<string, string>;
    } & Record<string, unknown>>;
  }

  interface GeographiesProps {
    geography: string;
    children: (args: GeographiesChildrenArgs) => ReactNode;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
}
