
$.getJSON("/chapters.json", function (data) {

    var form = new view({
        "@view": "<div id='control'>\
            <div> {{ msg }} </div>\
            <input class='form-control' value='{{msg}}' />\
        </div>",
        model: {
            msg: "输入点什么?"
        }
    });

    var chapter = new view({
        view: "view",
        model: {
            chapters: data,
            form: form
        }
    });

    var input = new view({
        view: "div#input",
        model: {
            text: "输入点什么?"
        }
    });

    $('pre code').each(function (i, block) {
        hljs.highlightBlock(block);
    });
});
