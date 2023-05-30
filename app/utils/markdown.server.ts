import {
  type HtmlOutput,
  processMarkdownToHtml as processMarkdownToHtmlImpl
} from "@benwis/femark";
import { LRUCache } from "lru-cache";

function cachify(fn: (args: string) => HtmlOutput) {
  const cache = new LRUCache<string, HtmlOutput, unknown>({
    ttl: 1000 * 60,
    maxSize: 1024,
    sizeCalculation: (value) => Buffer.byteLength(JSON.stringify(value))
  });
  return function (args: string): HtmlOutput {
    if (cache.has(args)) {
      return cache.get(args) as HtmlOutput;
    }
    const result = fn(args);
    cache.set(args, result);
    return result;
  };
}
export const processMarkdownToHtml = cachify(processMarkdownToHtmlImpl);
