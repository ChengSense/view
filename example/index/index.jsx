_scope => React.createElement("div", _scope, { "id": "grid", "class": "k-grid k-widget k-display-block" },
  _scope => React.createElement("div", _scope, { "class": "k-grid-header", "style": "padding-right: 17px;" },
    _scope => React.createElement("div", _scope, { "class": "k-grid-header-wrap k-auto-scrollable scrollable" },
      _scope => React.createElement("table", _scope, {},
        _scope => React.createElement("thead", _scope, {},
          _scope => React.createElement("tr", _scope, {},
            _scope => new Render(_scope, 'item,i').forEach(_scope.columns, () => [
              _scope => React.createElement("th", _scope, { "class": "k-header k-unselect", "data-field": "{i}" },
                _scope => React.createElement(_scope.item, _scope, null)
              )
            ]),
            _scope => React.createElement("th", _scope, { "class": "k-header" },
              _scope => React.createElement("操作项", _scope, null)
            )
          )
        )
      )
    )
  ),
  _scope => React.createElement("div", _scope, { "class": "k-grid-content k-auto-scrollable", "style": "height: 643px;" },
    _scope => React.createElement("table", _scope, { "style": "height: auto;" },
      _scope => React.createElement("tbody", _scope, {},
        _scope => new Render(_scope, 'item,id').forEach(_scope.list, () => [
          _scope => React.createElement("tr", _scope, { "class": "{id%2?'k-alt':''}" },
            _scope => new Render(_scope, 'col,i').forEach(_scope.item, () => [
              _scope => React.createElement("td", _scope, { "data-field": "{i}", "data-row": "{id}" },
                _scope => React.createElement(_scope.col, _scope, null)
              )
            ]),
            _scope => React.createElement("td", _scope, {},
              _scope => React.createElement("span", _scope, { "class": "k-button k-button-icontext k-grid-add", "@click": "add()" },
                _scope => React.createElement("添加", _scope, null)
              ),
              _scope => React.createElement("span", _scope, { "class": "k-button k-button-icontext k-grid-edit", "@click": "edit(id)" },
                _scope => new Render().when(_scope.edit == _scope.id, () => [
                  _scope => React.createElement(" 保存 ", _scope, null)
                ]).when(undefined, () => [
                  _scope => React.createElement(" 编辑 ", _scope, null)
                ])
              ),
              _scope => React.createElement("span", _scope, { "class": "k-button k-button-icontext k-grid-delete", "@click": "del(id)" },
                _scope => React.createElement("删除", _scope, null)
              )
            )
          )
        ])
      )
    )
  )
)