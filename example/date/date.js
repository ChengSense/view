Object.assign(Date.prototype, {
  Last: function () {
    var date = new Date(this);
    date.setMonth((date.getMonth() - 1), 1);
    return {
      date: date,
      year: date.getFullYear(),
      month: date.getMonth(),
      begin: date.getDate(),
      end: date.getLastDay(),
      dater: function () {
        var dater = new Array();
        for (var i = this.begin; i <= this.end; i++) {
          dater.push({
            year: this.year,
            month: this.month,
            date: i
          });
        }
        return dater;
      }
    }
  },
  Now: function () {
    var date = new Date(this);
    date.setDate(1);
    return {
      date: date,
      year: date.getFullYear(),
      month: date.getMonth(),
      begin: date.getDate(),
      end: date.getLastDay(),
      dater: function () {
        var dater = new Array();
        for (var i = this.begin; i <= this.end; i++) {
          dater.push({
            year: this.year,
            month: this.month,
            date: i
          });
        }
        return dater;
      }
    }
  },
  Next: function () {
    var date = new Date(this);
    date.setMonth((date.getMonth() + 1), 1);
    return {
      date: date,
      year: date.getFullYear(),
      month: date.getMonth(),
      begin: date.getDate(),
      end: date.getLastDay(),
      dater: function () {
        var dater = new Array();
        for (var i = this.begin; i <= this.end; i++) {
          dater.push({
            year: this.year,
            month: this.month,
            date: i
          });
        }
        return dater;
      }
    }
  },
  getCalendar: function () {
    var begin = this.Last().end - this.Now().date.getDay();
    var array = this.Last().dater().concat(this.Now().dater()).concat(this.Next().dater());
    array[begin].date == 1 ? (begin = begin - 7) : begin;
    array = array.slice(begin, begin + 42);
    var arr = [];
    for (let i = 0; i < 6; i++) {
      var items = []; arr.push(items);
      for (let l = 0; l < 7; l++) {
        items.push(array[i * 7 + l])
      }
    }
    return arr;
  },
  getYear: function (year, y) {
    var arr = [];
    for (let i = 0; i < 3; i++) {
      var items = []; arr.push(items);
      for (let l = 0; l < 5; l++) {
        items.push((year || new Date().getFullYear()) + i * 4 + l + (y || 0));
      }
    }
    return arr;
  },
  format: function (format) {
    var date = {
      "M+": this.getMonth() + 1,
      "d+": this.getDate(),
      "h+": this.getHours(),
      "m+": this.getMinutes(),
      "s+": this.getSeconds(),
      "q+": Math.floor((this.getMonth() + 3) / 3),
      "S+": this.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
      format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
      if (new RegExp("(" + k + ")").test(format)) {
        format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
      }
    }
    return format;
  },
  getLastDay: function (format) {
    return new Date(this.getFullYear(), (this.getMonth() + 1), 0).getDate(0);
  }
});
