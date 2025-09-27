/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'pdfjs-dist/webpack.mjs' { export * from 'pdfjs-dist' }
declare module 'pdfjs-dist/build/pdf.min.mjs' {
  const pdfjs: any;
  export = pdfjs;
}