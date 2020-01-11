(function () {

  function getId() {
    return (((1 + Math.random()) * 0x10000000) | 0).toString(16).substring(1);
  }

  let group = [{
    id: getId(),
    group_name: "产品",
    code: "product"
  }, {
    id: getId(),
    group_name: "订单",
    code: "order"
  }, {
    id: getId(),
    group_name: "支付",
    code: "pay"
  }];

  let api = {

    getId: getId,

    iface: function () {
      return {
        id: "",
        name: "",
        group_name: "",
        method: "GET",
        url: "",
        params: [{
          name: "",
          type: "",
          required: "",
          comment: "",
          value: ""
        }],
        response: "",
        comment: ""
      }
    },

    api: {
      list: (function () {
        let list = [];
        group.forEach(g => {
          for (let index = 0; index < 5; index++) {
            list.push({
              id: getId(),
              method: "POST",
              name: "api/user/list",
              url: "api/user/list",
              gid: g.id,
              group_name: g.group_name,
              params: [{
                name: "username",
                type: "int",
                required: "1",
                comment: "用户名",
                value: ""
              }, {
                name: "username",
                type: "int",
                required: "1",
                comment: "用户名",
                value: ""
              }],
              response: "无",
              comment: "获取用户信息"
            })
          }
        });
        return list;
      })(),
      getList() {
        let list = new Map();
        let apis = [];
        this.list.forEach(item => {
          let api = list.get(item.gid);
          if (api) {
            api.list.push(item);
          } else {
            let a = {
              id: item.gid,
              group_name: item.group_name,
              list: [item]
            };
            apis.push(a);
            list.set(item.gid, a);
          }
        });
        return apis;
      },
      getApi(id) {
        for (const i in this.list) {
          let api = this.list[i];
          if (id == api.id) {
            return api;
          }
        }
      },
      add(api) {
        this.list.push(api);
      },
      save(api) {
        this.list.forEach((item, i) => {
          if (item.id == api.id) {
            this.list.splice(i, 1, api);
          }
        });
      },
      delete(id) {
        this.list.forEach((api, i) => {
          if (api.id == id) {
            this.list.splice(i, 1)
          }
        });
      }
    },



    group: {
      list: group,
      getList() {
        return this.list;
      },
      getGroup(id) {
        for (const i in this.list) {
          let group = this.list[i];
          if (id == group.id) {
            return group;
          }
        }
      },
      add(group) {
        this.list.push(group);
      },
      save(group) {
        this.list.forEach((item, i) => {
          if (item.id == group.id) {
            this.list.splice(i, 1, group)
          }
        });
      },
      delete(id) {
        this.list.forEach((group, i) => {
          if (group.id == id) {
            this.list.splice(i, 1)
          }
        });
      }
    },


    setting: {
      list: [{
        id: 1,
        userName: "localhost",
        host: "127.0.0.1"
      }],
      getList() {
        return this.list;
      },
      getHost(id) {
        for (const i in this.list) {
          let host = this.list[i];
          if (id == host.id) {
            return host;
          }
        }
      },
      add(host) {
        this.list.push(host);
      },
      save(host) {
        this.list.forEach((item, i) => {
          if (item.id == host.id) {
            this.list.splice(i, 1, host)
          }
        });
      },
      delete(id) {
        this.list.forEach((host, i) => {
          if (host.id == id) {
            this.list.splice(i, 1)
          }
        });
      }
    }
  };
  window.api = api;
})()

var home = new Component({
  view: "#home",
  model: {
    ifaces: api.api.getList(),
    groups: api.group.getList(),
    sets: api.setting.getList()
  }
});

var iface = new Component({
  view: "#iface",
  model: {
    ifaces: api.api.getList()
  },
  action: {
    ifaceDle(id) {
      api.api.delete(id);
      iface.model.ifaces = api.api.getList();
    }
  }
});

var iface_detail = new Component({
  view: "#iface-detail",
  model: {
    hosts: api.setting.getList()
  }
});

var iface_save = new Component({
  view: "#iface-save",
  model: {
    groups: api.group.getList()
  },
  action: {
    ifaceSave() {
      if (app.model.add == "add" || app.model.add == "copy") {
        let a = app.model.iface;
        a.id = api.getId();
        a.group_name = api.group.getGroup(a.gid).group_name
        api.api.add(a);
      } else {
        let a = app.model.iface;
        a.group_name = api.group.getGroup(a.gid).group_name
        api.api.save(a);
      }
      iface.model.ifaces = api.api.getList();
      router.redreact("iface");
    },
    paramAdd() {
      app.model.iface.params.push({
        name: "",
        type: "string",
        required: "1",
        comment: ""
      });
    },
    paramDel(id) {
      if (1 < app.model.iface.params.length) {
        app.model.iface.params.splice(id, 1);
      }
    }
  }
});

var group = new Component({
  view: "#group",
  model: {
    list: api.group.getList()
  },
  action: {
    groupDel(id) {
      api.group.delete(id);
    }
  }
});

var group_save = new Component({
  view: "#group-save",
  model: {
    add: "add",
    group_name: "",
    code: ""
  },
  action: {
    groupSave() {
      var group = group_save.model;
      if (group.add == "add") {
        api.group.add({
          id: api.getId(),
          group_name: group.group_name,
          code: group.code
        });
      } else {
        api.group.save({
          id: group.id,
          group_name: group.group_name,
          code: group.code
        });
      }
      router.redreact("group");
    }
  }
});

var setting = new Component({
  view: "#setting",
  model: {
    list: api.setting.getList()
  },
  action: {
    setDel(id) {
      api.setting.delete(id);
    }
  }
});

var setting_save = new Component({
  view: "#setting-save",
  model: {
    add: "add",
    id: "",
    userName: "",
    host: ""
  },
  action: {
    setSave() {
      var sets = setting_save.model;
      if (sets.add == "add") {
        api.setting.add({
          id: api.getId(),
          userName: sets.userName,
          host: sets.host
        });
      } else {
        api.setting.save({
          id: sets.id,
          userName: sets.userName,
          host: sets.host
        });
      }
      router.redreact("setting");
    }
  }
});

var app = new View({
  view: "body",
  model: {
    add: "add",
    router: iface,
    iface: api.iface()
  }
});

let router = new Router(app, {
  "home": {
    component: home,
    router: "router",
    action(param) {
      home.model.ifaces = api.api.getList();
      home.model.sets = api.setting.getList();
      home.model.groups = api.group.getList();
    }
  },
  "iface": {
    component: iface,
    router: "router",
    action(param) {

    }
  },
  "iface/save/:add/:id": {
    component: iface_save,
    router: "router",
    action(param) {
      app.model.iface = api.iface();
      app.model.add = param.add;
      let iface = api.api.getApi(param.id);
      switch (param.add) {
        case "add":
          app.model.iface = api.iface();
          break;
        case "edit":
          app.model.iface = iface;
          break;
        case "copy":
          app.model.iface = iface;
          app.model.iface.id = "";
          break;
      }
    }
  },
  "iface/detail/:id": {
    component: iface_detail,
    router: "router",
    action(param) {
      let iface = api.api.getApi(param.id);
      app.model.iface = iface;
    }
  },
  "group": {
    component: group,
    router: "router",
    action(param) {

    }
  },
  "group/:add/:id": {
    component: group_save,
    router: "router",
    action(param) {
      var grou = group_save.model;
      grou.add = param.add;
      if (param.add == "add") {
        grou.id = "";
        grou.code = "";
        grou.group_name = "";
      } else {
        let group = api.group.getGroup(param.id);
        grou.id = group.id;
        grou.code = group.code;
        grou.group_name = group.group_name;
      }
    }
  },
  "setting": {
    component: setting,
    router: "router",
    action(param) {

    }
  },
  "setting/:add/:id": {
    component: setting_save,
    router: "router",
    action(param) {
      var sets = setting_save.model;
      sets.add = param.add;
      if (param.add == "add") {
        sets.id = "";
        sets.userName = "";
        sets.host = "";
      } else {
        let host = api.setting.getHost(param.id);
        sets.id = host.id;
        sets.userName = host.userName;
        sets.host = host.host;
      }
    }
  }
});