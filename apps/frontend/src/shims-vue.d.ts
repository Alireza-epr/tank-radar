// ts-jest (unlike vue-tsc) doesn't understand .vue files natively - this
// shim tells plain TypeScript what an imported .vue file's type looks like.
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
