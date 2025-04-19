// src/wasm.d.ts
declare module '*.wasm' {
  const path: string;
  export default path;
}

declare module '*.wasm?url' {
  const path: string;
  export default path;
}
