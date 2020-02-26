export let $lang = /(@each|@when|\.when)\s*\((.*)\)\s*\{|\.when\s*\{|\{([^\{\}]*)\}|\}/g;
export let $chen = /(@each|@when|\.when)\s*(\((.*)\))?\s*\{/;
export let $express = /\{([^\{\}]*)\}/;
export let $when = /,\s*\.when/g;