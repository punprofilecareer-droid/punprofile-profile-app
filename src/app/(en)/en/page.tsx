/**
 * `/en`, the English home page. 16/08/2026.
 *
 * A re-export, and every file in this tree is one. The pages themselves live in
 * `src/app/(th)/` and are language-agnostic: they take their words from
 * `useCopy()`, which takes them from the `LocaleProvider` in the root layout,
 * which this tree's root layout sets to English. So the only thing an English
 * route file adds is its own metadata, and the home page's comes from the root
 * layout above it.
 *
 * `locale.ts` explains why the English tree is prefixed and the Thai one is not,
 * and why that costs a folder of files like this one.
 */
export { default } from "../../(th)/page";
