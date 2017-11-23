$.get("/chapter-1.html", function (data) {

    new view({
        view: "chapter-1",
        model: {
            chapter1: data
        }
    });

    $('pre code').each(function (i, block) {
        hljs.highlightBlock(block);
    });

});

$.get("/chapter-2.html", function (data) {

    new view({
        view: "chapter-2",
        model: {
            chapter2: data
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

$.get("/chapter-3.html", function (data) {

    new view({
        view: "chapter-3",
        model: {
            chapter3: data
        }
    });

    $('pre code').each(function (i, block) {
        hljs.highlightBlock(block);
    });

});
