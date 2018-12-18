import { global } from "./ViewIndex";
import { mq } from "./ViewObserve";

export function watcher(target, object, prop, path) {
  var value = object[prop], cache = new Map();
  Object.defineProperty(object, prop, {
    get() {
      mq.publish(target, "get", [path]);
      global.$cache = cache;
      return value;
    },
    set(val) {
      var oldCache = cache;
      cache = new Map();
      value = val
      mq.publish(target, "set", [oldCache, cache]);
    }
  });
}
