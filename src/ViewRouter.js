export function Router(app, params) {
  var $param = /^:/;
  let rout, para, router;
  this.redreact = redreact;

  function resolver(hash) {
    router = Object.keys(params);
    while (router.length) {
      rout = router.shift(), para = {};
      let path = rout.split("/");
      let hath = hash.split("/");

      if (match(path, hath)) return {
        component: params[rout].component,
        action: params[rout].action,
        params: para,
        router: rout
      }
    }
  }

  function match(path, hash) {
    while (hash.length) {
      let name = path.shift();
      let param = hash.shift();
      if (param != name) {
        if (!$param.test(name)) {
          return false;
        }
        name = name.replace($param, "")
        para[name] = param;
      }
    }
    return true;
  }

  function redreact(path) {
    let url = window.location.pathname;
    window.location.href = url + "#" + path;
  }

  function action(event) {
    var hash = window.location.hash.replace("#", "");
    let router = resolver(hash);
    if (router) {
      router.action(router.params);
      app.model.router = router.component;
    }
  }

  window.addEventListener("load", action, false);
  window.addEventListener("onpopstate" in window ? "popstate" : "hashchange", action, false);

}