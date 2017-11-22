$.get("/chapter.html", function (data) {

    new view({
        view: "view",
        model: {
            chapters: data
        }
    });

    new view({
        view: "div#input",
        model: {
            text: "输入点什么?"
        }
    });

    $('pre code').each(function (i, block) {
        hljs.highlightBlock(block);
    });

});