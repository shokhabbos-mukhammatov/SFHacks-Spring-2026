declare module 'swagger-jsdoc' {
  export type Options = {
    definition: Record<string, unknown>;
    apis?: string[];
  };

  export default function swaggerJSDoc(options: Options): Record<string, unknown>;
}
