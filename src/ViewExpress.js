
export var $express = /\{\s*\{>?@?([^\{\}]*)\}\s*\}/g;
export var $express1 = /\{\s*\{([^\{\}]*)\}\s*\}/;
export var $express2 = /\{\s*\{([^>@\{\}]*)\}\s*\}/g;
export var $html = /\{\s*\{\s*>([^\{\}]*)\}\s*\}/;
export var $view = /\{\s*\{\s*@([^\{\}]*)\}\s*\}/;
export var $each = /(@each)\s*\((.*)\s*,\s*\{/;
export var $when = /(@when)\s*\((.*)\s*,\s*\{/;
export var $else = /(@else)/;
export var $chen = /(@each|@when)\s*\((.*)\s*,\s*\{/;
export var $lang = /((@each|@when)\s*\((.*)\s*,\s*\{|\{\s*\{([^\{\}]*)\}\s*\}|\s*\}\s*\)|@else)/g;
export var $close = /\}\s*\)\s*/;
export var $break = /\}\s*\)|(@else)/;
export var $word = /(\w+)((\.\w+)|(\[(.+)\]))*/g;
export var $word1 = /\w+/g;


