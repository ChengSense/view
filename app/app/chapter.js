var form = new view({
    "@view": 
    "<div id='control'>\
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
        chapters: "",
        form: form
    },
    controller(model) {
        $.get("/chapter.html", function (data) {
            model.chapters = data;
            $('pre code').each(function (i, block) {
                hljs.highlightBlock(block);
            });
        });
    }
});
