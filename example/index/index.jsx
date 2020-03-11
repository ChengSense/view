React.createElement("div", { "id": `grid`, "class": `k-grid k-widget k-display-block` },
  React.createElement("div", { "class": `k-grid-header`, "style": `padding-right: 17px;` },
    React.createElement("div", { "class": `k-grid-header-wrap k-auto-scrollable scrollable` },
      React.createElement("table", {},
        React.createElement("thead", {},
          React.createElement("tr", {},
            new Render().forEach(columns, (item, i) => [
              React.createElement("th", { "class": `k-header k-unselect`, "data-field": `${i}`, "@mousemove": `resize` },
                React.createElement(item, null)
              )
            ]),
            React.createElement("th", { "class": `k-header` },
              React.createElement("操作项", null)
            )
          )
        )
      )
    )
  ),
  React.createElement("div", { "class": `k-grid-content k-auto-scrollable`, "style": `height: 643px;`, "onScroll": `scroll` },
    React.createElement("table", { "style": `height: auto;` },
      React.createElement("tbody", {},
        new Render().forEach(list, (item, id) => [
          React.createElement("tr", { "class": "${id % 2 ? 'k-alt' : ''}" },
            new Render().forEach(item, (col, i) => [
              React.createElement("td", { "data-field": `${i}`, "data-row": `${id}` },
                React.createElement(col, null)
              )
            ]),
            React.createElement("td", {},
              React.createElement("span", { "class": `k-button k-button-icontext k-grid-add`, "@click": `add()` },
                React.createElement("添加", null)
              ),
              React.createElement("span", { "class": `k-button k-button-icontext k-grid-edit`, "@click": `edit(id)` },
                new Render().when(edit == id, () => [
                  React.createElement(" 保存 ", null)
                ]).when(undefined, () => [
                  React.createElement(" 编辑 ", null)
                ])
              ),
              React.createElement("span", { "class": `k-button k-button-icontext k-grid-delete`, "onClick": `del(id)` },
                React.createElement("删除", null)
              )
            )
          )
        ])
      )
    )
  )
)