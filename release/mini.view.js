var view=function(n){"use strict";var t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},o=function(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")},c=function(){function e(e,n){for(var t=0;t<n.length;t++){var o=n[t];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(n,t,o){return t&&e(n.prototype,t),o&&e(n,o),n}}();function i(e,n,t){for(;e.length;){var o=e[0];if(n.call(t,o,e))break}}function r(e,n,t){if(e)return t=t||e,Object.keys(e).every(function(o){var c=e[o];return!n.call(c,c,o,t)}),t}function a(e,n,t){if(e)if(e.hasOwnProperty("$index"))for(var o=e.$index;o<e.$length;o++)n.call(t,e[o],o);else Object.keys(e).forEach(function(o){n.call(t,e[o],o)})}function s(e){return[].slice.call(e)}function l(e,n){e&&Object.values(e).forEach(function(e){var t,o,c=(t=n,o={},Object.keys(t).forEach(function(e){o[e]=t[e]}),o);c.__proto__=Function.__proto__,e.__proto__=c})}function d(e,n){return e.__proto__=n,e}function h(e,n){var t=e.prototype||e.__proto__;return Object.keys(n).forEach(function(e){t[e]=n[e]}),e}function u(e){return null==e||void 0==e||""==e}Object.values||h(Object,{values:function(e){var n=[];return Object.keys(e).forEach(function(t){n.push(e[t])}),n}}),h(Array,{remove:function(e){var n=this.indexOf(e);return n>-1&&this.splice(n,1),this},replace:function(e,n){var t=this.indexOf(e);t>-1&&this.splice(t,1,n)},splices:function(e){this.splice.apply(this,e)},has:function(e){return this.indexOf(e)>-1},ones:function(e){this.has(e)||this.push(e)}});var f=/((@each|@when|\.when)\s*\((.*)\)\s*\{|\{\s*([^\{\}]*)\s*\}|\s*\}\s*|\.when\s*\{)/g,p=/(@each|@when|\.when)\s*\((.*)\)\s*\{|\.when\s*\{/,v=/(@each)\s*\((.*)\)\s*\{/g,m=/(@when|\.when)\s*\((.*)\)\s*\{|\.when\s*\{/g,w=/\.when\s*\((.*)\)\s*\{|\.when\s*\{/g,g=/@when/g,y=/\{\s*@?([^\{\}]*)\s*\}/,N=/\{\s*([^\{\}]*)\s*\}/g,b=/\{\s*\s*@([^\{\}]*)\s*\}/,$=/(^\s*\}\s*$)/,E=/(\w+)((\.\w+)|(\[(.+)\]))*/g,x=/^@(.*)/;function V(e,n){try{return B.$path=void 0,B.$cache=void 0,O(e)(n)}catch(e){return}}function _(e,n){try{return O(e="'"+e.replace(N,"'+($1)+'")+"'")(n)}catch(e){return}}function O(e){return new Function("_scope","with (_scope) {\n       return "+e+";\n    }")}function C(e){try{return e.replace(/(\w+)\.?/g,"['$1']")}catch(e){return}}function j(e,n,t){t=""+C(t),Object.defineProperty(e,n,{get:function(){return new Function("scope","\n        return scope"+t+";\n        ")(e)},set:function(n){new Function("scope","val","\n        scope"+t+"=val;\n        ")(e,n)}})}function k(e){try{return document.querySelectorAll(e)}catch(t){var n=document.createElement("div");return n.innerHTML=e.trim(),n.childNodes}}function S(e,n,t){this.addEventListener?this.addEventListener(e,function(e){n.forEach(function(n,o){n.forEach(function(n){var c=n?V("["+n+"]",t):[];c.push(e),o.apply(d({$view:o.$view,$action:o.$action},o.$model),c)})})},!1):this.attachEvent?this.attachEvent("on"+e,function(e){n.forEach(function(n,o){n.forEach(function(n){var c=n?V("["+n+"]",t):[];c.push(e),o.apply(d({$view:o.$view,$action:o.$action},o.$model),c)})})}):element["on"+e]=function(e){n.forEach(function(n,o){n.forEach(function(n){var c=n?V("["+n+"]",t):[];c.push(e),o.apply(d({$view:o.$view,$action:o.$action},o.$model),c)})})}}function A(n,t,o,c,r){function l(e,n){a(e.attributes,function(e){if(e){var t=function(e,n,t){return{node:e,clas:t,children:[],scope:n,childNodes:[]}}(e,n,e.cloneNode());new RegExp(N).test(e.nodeValue)&&(f.attrExpress(e,n,t),e.nodeValue=_(e.nodeValue,n)),function(e,n){e.name.replace(x,function(t){t=t.replace(x,"$1");var o=e.ownerElement,c=e.nodeValue.toString().match(/\(([^)]*)\)/);if(c){var i=e.nodeValue.toString().replace(c[0],""),a=V(i,r.action);o.on(t,a,n,c[1])}else{var s=V(e.nodeValue,r.action);o.on(t,s,n)}})}(e,n)}})}function d(e,n,t,o){var c=void 0;l(e,n),new RegExp(b).test(e.nodeValue)?(!function(e,n,t,o){var c=document.createComment("component");e.parentNode.replaceChild(c,e),t.scope=n,t.resolver="component",t.content=o,t.childNodes.push({node:c,children:[],content:t,childNodes:[]})}(e,n,t,o),F.component(t,r)):(c=new RegExp(y).exec(e.nodeValue))&&(f.express(e,n,t,c[0]),e.nodeValue=V(c[1],n))}function h(e){if(e)return new RegExp(w).test(e.clas.nodeValue)}var f={attrEach:function(e,n,t,o){void 0!=B.$cache&&(t.resolver="each",t.content=o,t.scope=n,t.node=e,R(t,r,B.$cache))},each:function(e,n,t,o){void 0!=B.$cache&&(t.resolver="each",t.content=o,t.scope=n,t.node=e,R(t,r,B.$cache))},when:function(e,n,t){var o=t.clas.nodeValue,c=new RegExp(m).exec(o);if(c){var i=c.pop();t.resolver="when",t.scope=n,t.node=e,$(i,n,t)}},express:function(e,n,t,o){t.resolver="express",t.scope=n,t.node=e,$(o,n,t)},attrExpress:function(e,n,t){t.clas.nodeValue.replace(N,function(o){t.resolver="express",t.scope=n,t.node=e,"model"!=t.clas.name&&$(o,n,t)}),"value"!=t.clas.name&&"model"!=t.clas.name||function(e,n){var t=e.ownerElement;t._express=e.nodeValue.replace(y,"$1");var o="scope"+C(t._express);(O[t.type]||O[t.localName]||O.other)(e,n,o)}(e,n)}};function $(e,n,t){e.replace(E,function(e){V(e,n),void 0!=B.$cache&&R(t,r,B.$cache)})}var O={checkbox:function(e,n,t){try{var o=e.ownerElement;o.on("change",function(){var e=o.value.replace(/(\'|\")/g,"\\$1"),c=t+"."+(o.checked?"ones":"remove")+"('"+e+"');";new Function("scope",c)(n)}),V(o._express,n).has(o.value)&&(o.checked=!0)}catch(e){console.log(e)}},radio:function(n,t,o){try{var c=n.ownerElement;c.on("change",function(){var e=c.value.replace(/(\'|\")/g,"\\$1");new Function("scope",o+"='"+e+"';")(t)}),V(c._express,t)==c.value&&(c.checked=!0),c.name=B.$path}catch(n){console.log(e)}},select:function(n,t,o){try{var c,i=n.ownerElement;i.on("change",c=function(){var e=i.value.replace(/(\'|\")/g,"\\$1");new Function("scope",o+"='"+e+"';")(t)});var r=V(i._express,t);u(r)?c():i.value=r}catch(n){console.log(e)}},other:function(n,t,o){try{var c=n.ownerElement;c.on("change",function(){var e=c.value.replace(/(\'|\")/g,"\\$1");new Function("scope",o+"='"+e+"';")(t)})}catch(n){console.log(e)}}};function k(e,n){return{node:e,clas:n.clas,children:n.children,scope:n.scope,childNodes:[]}}function S(e,n,t){var o=document.createComment("each:"+B.$path);return n.appendChild(o),{node:e,clas:t.clas,children:t.children,scope:t.scope,childNodes:[{node:o,clas:t.clas,children:[],scope:t.scope,childNodes:[]}]}}!function e(n,t,o,c){i(o,function(o,r){if(1==o.clas.nodeType)if(o.clas.hasAttribute("each")){var l=(E=o.clas.getAttribute("each").split(":")).shift().trim(),u=E.pop().trim(),w=E.shift(),y=V(u,t),N=S(null,n,o);c.childNodes.push(N),f.attrEach(null,t,N,c,y),a(y,function(i,r){var a=Object.create(t||{});j(a,l,B.$path),w&&(a[w.trim()]=r.toString());var h=o.clas.cloneNode();h.removeAttribute("each"),n.appendChild(h);var u=k(h,o);N.childNodes.push(u),e(h,a,s(o.children),u),d(h,a,u,c)})}else if(/(CODE|SCRIPT)/.test(o.clas.nodeName)){var b=o.clas.cloneNode(!0);n.appendChild(b);var $=k(b,o);c.childNodes.push($)}else b=o.clas.cloneNode(),n.appendChild(b),$=k(b,o),c.childNodes.push($),e(b,t,s(o.children),$),d(b,t,$,c);else if(v.test(o.clas.nodeValue)){var E;l=(E=o.clas.nodeValue.replace(v,"$2").split(":")).shift().trim(),u=E.pop().trim(),w=E.shift(),y=V(u,t),N=S(null,n,o),c.childNodes.push(N),f.each(null,t,N,c,y);var x=s(o.children);a(y,function(c,i){var r=Object.create(t||{});j(r,l,B.$path),w&&(r[w.trim()]=i.toString());var a=k(null,o);N.childNodes.push(a),e(n,r,s(x),a)})}else{if(m.test(o.clas.nodeValue)){var _=V(o.clas.nodeValue.replace(m,"$2"),t);return(N=function(e,n,t,o,c){if(new RegExp(g).test(t.clas.nodeValue)){var i=document.createComment("when:"+B.$path);n.appendChild(i),o.childNodes.push(o={node:e,clas:t.clas,children:[],scope:t.scope,content:o,childNodes:[{node:i,clas:t.clas,children:[],scope:t.scope,childNodes:[]}]}),f.when(null,c,o)}return o}(null,n,o,c,t)).children.push(r.shift()),_?(f.when(null,t,N,c),i(r,function(e,n){if(!h(e))return!0;N.children.push(n.shift())}),i(s(o.children),function(o,c){if(1==o.clas.nodeType||p.test(o.clas.nodeValue))e(n,t,c,N);else{var i=o.clas.cloneNode();n.appendChild(i);var r=k(i,o);N.childNodes.push(r),d(i,t,r,N)}c.shift()})):void 0==_?(f.when(null,t,N,c),i(s(o.children),function(o,c){if(1==o.clas.nodeType||p.test(o.clas.nodeValue))e(n,t,c,N);else{var i=o.clas.cloneNode();n.appendChild(i);var r=k(i,o);N.childNodes.push(r),d(i,t,r,N)}c.shift()})):h(r[0])&&e(n,t,r,N),h(o)}b=o.clas.cloneNode(),n.appendChild(b),$=k(b,o),c.childNodes.push($),d(b,t,$,c)}r.shift()})}(n,t,o,c)}h(Node,{on:function(e,n,t,o){if(this._manager)if(this._manager.get(e)){var c=this._manager.get(e);c.get(n)?c.get(n).ones(o):c.set(n,[o])}else{var i=new Map;i.set(n,[o]),this._manager.set(e,i),S.call(this,e,i,t)}else{var r=new Map;r.set(n,[o]),this._manager=new Map,this._manager.set(e,r),S.call(this,e,r,t)}return this},off:function(e,n){if(this._manager){var t=this._manager.get(e);if(void 0==t)return;if(t.delete(n),t.size)return;this._manager.delete(e),function(e,n){this.addEventListener?this.removeEventListener(e,n,!1):this.detachEvent?this.detachEvent("on"+e,n):element["on"+e]=null}.call(this,e,n)}return this},reappend:function(e){return r(s(this.childNodes),function(e){e.parentNode.removeChild(e)}),this.appendChild(e),this},before:function(e){this.parentNode.insertBefore(e,this)},after:function(e){this.nextSibling?this.parentNode.insertBefore(e,this.nextSibling):this.parentNode.appendChild(e)}}),h(NodeList,{on:function(e,n){return r(this,function(t){t.on(e,n)}),this},off:function(e,n){return r(this,function(t){t.off(e,n)}),this}});var F={view:function(e,n,t,o,c){try{var i=document.createDocumentFragment();new A(i,t,s(n.children),o,c),o.children=n.children,o.clas=n.clas,e.reappend(i)}catch(e){console.log(e)}},component:function(e,n){try{var t=function(e,n){try{return B.$path=void 0,B.$cache=void 0,O(e=e.replace(y,"$1"))(n)}catch(e){return}}(e.clas.nodeValue,e.scope),o=B.$cache;if(e.path=[B.$path],u(t))return;d(t.model,e.scope);var c=P(e.childNodes),i=e.content.childNodes;q(e.childNodes);var r=new I({view:t.component,model:t.model,action:t.action}),a=function(e,n,t){var o=document.createComment("component:"+n.path);return e.before(o),t.content.node=t.view,{clas:n.clas,children:[t.node],scope:n.scope,resolver:n.resolver,content:n.content,childNodes:[{node:o,children:[],scope:n.scope,childNodes:[]},t.content]}}(c,e,r);R(a,n,o),i.replace(e,a),c.parentNode&&c.parentNode.replaceChild(r.view,c)}catch(e){console.log(e)}},when:function(e,n){try{var t=P(e.childNodes),o=document.createDocumentFragment(),c=e.content.childNodes;q(e.childNodes),new A(o,e.scope,s(e.children),e.content,n),c.replace(e,c.pop()),t.parentNode&&t.parentNode.replaceChild(o,t)}catch(e){console.log(e)}},each:function(e,n){try{var t=P(e.childNodes),o=document.createDocumentFragment(),c=e.content.childNodes;q(e.childNodes),new A(o,e.scope,[e],e.content,n),c.replace(e,c.pop()),t.parentNode&&t.parentNode.replaceChild(o,t)}catch(e){console.log(e)}},arrayEach:function(e,n,t,o){try{var c=function e(n,t){try{return r(n,function(n){if(n.node&&n.node.parentNode)return t=n.node;if(n.childNodes.length){var o=n.childNodes[n.childNodes.length-1];if(o.node&&o.node.parentNode)return t=o.node;t=e([o])}}),t}catch(e){console.log(e)}}([e.childNodes[t]]),i=document.createDocumentFragment(),a={clas:e.clas,children:e.children,scope:e.scope},l={childNodes:[],children:[]};new A(i,e.scope,[a],l,n),i.removeChild(i.childNodes[0]);var d=s(l.childNodes[0].childNodes);d.splice(0,1,t+1,0),e.childNodes.splices(d),o.remove(l.childNodes[0]),c.parentNode&&c.after(i)}catch(e){console.log(e)}},express:function(e,n){try{e.node.nodeValue=_(e.clas.nodeValue,e.scope),R(e,n,B.$cache),"value"==e.node.name&&(e.node.ownerElement.value=e.node.nodeValue)}catch(e){console.log(e)}},attribute:function(e,n){try{var t=document.createAttribute(_(e.clas.name,scope));R(e,n,B.$cache),t.nodeValue=e.clas.nodeValue,e.node.ownerElement.setAttributeNode(t),e.node.ownerElement.removeAttributeNode(e.node)}catch(e){console.log(e)}}},T=function(e,n,t){try{e.forEach(function(e,o){e.forEach(function(c){M[c.resolver](c,n,t,o,e)})})}catch(e){console.error(e)}},M={each:function(e,n,t,o,c){try{var i=n.length;if(t>0)q(e.childNodes.splice(i+1)),F.arrayEach(e,o,e.childNodes.length-1,c);else q(e.childNodes.splice(i+1))}catch(e){console.error(e)}}};function R(e,n,t){var o=t.get(n);o?o.ones(e):t.set(n,[e])}function P(e,n){try{return r(e,function(e){if(e.node&&e.node.parentNode)return n=e.node,e.node=null,n;n=P(e.childNodes)}),n}catch(e){console.log(e)}}function q(e){e.forEach(function(e){if(e.node&&e.node.parentNode)return e.node.parentNode.removeChild(e.node);e.childNodes&&q(e.childNodes)})}function L(e,n,o){function c(n,o,c){n instanceof I||"object"==(void 0===n?"undefined":t(n))&&(Array.isArray(n)&&function(n,t){function o(){return new Function("scope","\n        return scope"+C(t)+";\n        ")(e),B.$cache}a.forEach(function(c){var r=Array.prototype[c];switch(c){case"shift":case"pop":Object.defineProperty(n,c,{writable:!0,value:function(){var e=r.apply(this,arguments);return T(o(),this),e}});break;case"splice":Object.defineProperty(n,c,{writable:!0,value:function(e,n){if(0<this.length){var c=this.length,a=r.apply(this,arguments);if(arguments.length>2){var s=this.$index=c;for(this.$length=this.length;s<this.$length;)i(this,s++,t)}return T(o(),this,arguments.length-2),delete this.$index,delete this.$length,a}}});break;case"push":Object.defineProperty(n,c,{writable:!0,value:function(e){var n=this.length,c=r.call(this,e);for(this.$index=n,this.$length=this.length;n<this.length;)i(this,n++,t);return T(o(),this,1),delete this.$index,delete this.$length,c}});break;default:Object.defineProperty(n,c,{writable:!0,value:function(){var o=r.apply(this,arguments);return new Function("scope","val","\n        scope"+C(t)+"=val;\n        ")(e,n),o}})}})}(n,o),Object.keys(n).forEach(function(e){i(n,e,o,c)}))}function i(n,o,i,a){var s=i?i+"."+o:o,l=n[o];if(l instanceof I)r(n,o,s);else if("object"==(void 0===l?"undefined":t(l))&&void 0!=a)c(l,s,a[o]),r(n,o,s);else if("object"==(void 0===l?"undefined":t(l)))c(l,s),r(n,o,s);else if(void 0!=a){r(n,o,s);var d=a[o],h=B.$cache;D.publish(e,"set",[d,h,n])}else r(n,o,s)}function r(n,o,i){var r=n[o],a=new Map;Object.defineProperty(n,o,{get:function(){return D.publish(e,"get",[i]),B.$cache=a,r},set:function(o){var s=r,l=a;a=new Map,c(r=function e(n){if(n instanceof Boolean||n instanceof String||n instanceof Number||n instanceof Date||n instanceof View)return n;if(Array.isArray(n)){var o=[];return Object.keys(n).forEach(function(t){o[t]=e(n[t])}),o}if(n&&"object"===(void 0===n?"undefined":t(n))){var c={};return Object.keys(n).forEach(function(t){c[t]=e(n[t])}),c}return n}(o),i,s),D.publish(e,"set",[s,l,n])}})}var a=["shift","push","pop","splice","unshift","reverse"];D.subscribe(e,"set",n),D.subscribe(e,"get",o),c(e)}var D=new(function(){function e(){o(this,e),this.map=new Map}return c(e,[{key:"publish",value:function(e,n,t){var o=this.map.get(e);if(o){var c=o.get(n);c?c.data.push(t):o.set(n,{data:[t],queue:[]})}else{var i=new Map;i.set(n,{data:[i],queue:[]}),this.map.set(e,i)}this.notify(o.get(n))}},{key:"notify",value:function(e){if(e)for(var n=function(){var n=e.data.shift();e.queue.forEach(function(e){e(n[0],n[1],n[2])})};e.data.length;)n();else this.map.forEach(function(e){e.forEach(function(e){for(var n=function(){var n=e.data.shift();e.queue.forEach(function(e){e(n[0],n[1],n[2])})};e.data.length;)n()})})}},{key:"subscribe",value:function(e,n,t){var o=this.map.get(e);if(o){var c=o.get(n);c?c.queue.push(t):o.set(n,{data:[],queue:[t]})}else{var i=new Map;i.set(n,{data:[],queue:[t]}),this.map.set(e,i)}}}]),e}());var B={$path:void 0},I=function(){function e(n){o(this,e),this.content={childNodes:[],children:[]},this.model=n.model,this.action=n.action,L(n.model,function(e,n,t){!function(e,n){e.forEach(function(e,n){s(e).forEach(function(t){!function e(n,t){try{return n.every(function(n){if(n.node){var o=n.node.ownerElement||n.node;return t=document.body.contains(o),!1}t=e(n.childNodes)}),t}catch(e){console.log(e)}}([t])?e.remove(t):F[t.resolver](t,n)})})}(n)},function(e){B.$path=e}),n.view?this.view(n):this.component(n)}return c(e,[{key:"view",value:function(e){var n=k(e.view),t=function e(n,t){var o=t||[];return i(n,function(t){if(n.shift(),new RegExp($).test(t.nodeValue))return!0;var c={clas:t.cloneNode(!0),children:[]};3==t.nodeType&&""==t.nodeValue.trim()||o.push(c),1==t.nodeType?e(s(t.childNodes),c.children):new RegExp(p).test(t.nodeValue)&&e(n,c.children)}),o}(function e(n){return r(n,function(n){n.childNodes[0]&&!/(CODE|SCRIPT)/.test(n.nodeName)&&e(s(n.childNodes)),3==n.nodeType&&n.nodeValue.replace(f,function(e){var t=n.nodeValue.split(e);n.parentNode.insertBefore(document.createTextNode(t[0]),n),n.parentNode.insertBefore(document.createTextNode(e.trim()),n),n.nodeValue=n.nodeValue.replace(t[0],"").replace(e,"")})}),n}(s(n)))[0];this.node=t,this.view=n[0],l(e.action,{$view:this.view,$model:e.model,$action:e.action}),F.view(this.view,t,e.model,this.content,this)}},{key:"component",value:function(e){var n=k(e.component);this.view=n[0],this.view.parentNode.removeChild(this.view),this.component=this.view.outerHTML}}]),e}();return window.View=I,window.Router=function(e,n){var t=/^:/,o=/^\/(.+)/,c=void 0,i=void 0,r=void 0;this.redreact=h;var a,s=!((a=window.navigator.userAgent).indexOf("compatible")>-1&&a.indexOf("MSIE")>-1||a.indexOf("Trident")>-1||a.indexOf("Edge")>-1)&&window.history&&"pushState"in window.history;function l(e){for(r=Object.keys(n);r.length;){c=r.shift(),i={};var t=c.replace(o,"$1");if(d(t=t.split("/"),e.split("/")))return{component:n[c].component,router:n[c].router,action:n[c].action,after:n[c].after,params:i,path:e}}}function d(e,n){for(;n.length;){var o=e.shift(),c=n.shift();if(c!=o){if(!t.test(o))return!1;o=o.replace(t,""),i[o]=c}}return!0}function h(e){var n=window.location.pathname;window.location.href=n+"#"+e}function u(n){var t=l(window.location.hash.replace(/^#\/?/,""));t?(t.action(t.params),e.model[t.router]=t.component,t.after&&t.after()):void 0!=n&&"load"!=n.type||h("")}window.addEventListener("load",u,u()),window.addEventListener(s?"popstate":"hashchange",u,!1)},window.query=k,n.global=B,n.View=I,n}({});
