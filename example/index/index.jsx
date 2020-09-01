(_scope, func) => React.createElement("div", _scope, func, { "id": "grid", "class": "k-grid k-widget k-display-block" },
  (_scope, func) => React.createElement("div", _scope, func, { "class": "k-grid-header", "style": "padding-right: 17px;" },
    (_scope, func) => React.createElement("div", _scope, func, { "class": "k-grid-header-wrap k-auto-scrollable scrollable" },
      (_scope, func) => React.createElement("table", _scope, func, {},
        (_scope, func) => React.createElement("thead", _scope, func, {},
          (_scope, func) => React.createElement("tr", _scope, func, {},
            (_scope, func) => new Render(_scope, func).forEach(_scope.columns, 'item', 'i', [
              (_scope, func) => React.createElement("th", _scope, func, { "class": "k-header k-unselect", "data-field": "{i}" },
                (_scope, func) => React.createElement(_scope.item, _scope, func, null)
              )
            ]),
            (_scope, func) => React.createElement("th", _scope, func, { "class": "k-header" },
              (_scope, func) => React.createElement("操作项", _scope, func, null)
            )
          )
        )
      )
    )
  ),
  (_scope, func) => React.createElement("div", _scope, func, { "class": "k-grid-content k-auto-scrollable", "style": "height: 643px;" },
    (_scope, func) => React.createElement("table", _scope, func, { "style": "height: auto;" },
      (_scope, func) => React.createElement("tbody", _scope, func, {},
        (_scope, func) => new Render(_scope, func).forEach(_scope.list, 'item', 'id', [
          (_scope, func) => React.createElement("tr", _scope, func, { "class": "{id%2?'k-alt':''}" },
            (_scope, func) => new Render(_scope, func).forEach(_scope.item, 'col', 'i', [
              (_scope, func) => React.createElement("td", _scope, func, { "data-field": "{i}", "data-row": "{id}" },
                (_scope, func) => React.createElement(_scope.col, _scope, func, null)
              )
            ]),
            (_scope, func) => React.createElement("td", _scope, func, {},
              (_scope, func) => React.createElement("span", _scope, func, { "class": "k-button k-button-icontext k-grid-add", "@click": "add()" },
                (_scope, func) => React.createElement("添加", _scope, func, null)),
              (_scope, func) => React.createElement("span", _scope, func, { "class": "k-button k-button-icontext k-grid-edit", "@click": "edit(id)" },
                (_scope, func) => new Render(_scope, func).when(_scope.edit == _scope.id, [
                  (_scope, func) => React.createElement(" 保存 ", _scope, func, null)
                ]).when(undefined, [
                  (_scope, func) => React.createElement(" 编辑 ", _scope, func, null)
                ])
              ),
              (_scope, func) => React.createElement("span", _scope, func, { "class": "k-button k-button-icontext k-grid-delete", "@click": "del(id)" },
                (_scope, func) => React.createElement("删除", _scope, func, null)
              )
            )
          )
        ])
      )
    )
  )
)
