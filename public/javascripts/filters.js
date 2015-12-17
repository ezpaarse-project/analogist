angular.module('WebApp')
.filter('timeAgo', function () {
  return function (input) {
    var secondsAgo = (Date.now() - (new Date(input)).getTime()) / 1000;
    var time;
    var unit;

    if (isNaN(secondsAgo)) { return '?'; }

    if (secondsAgo < 60) {
      unit = 'seconde';
      time = parseInt(secondsAgo);
    } else if (secondsAgo < 3600) {
      unit = 'minute';
      time = parseInt(secondsAgo / 60);
    } else if (secondsAgo < 86400) {
      unit = 'heure';
      time = parseInt(secondsAgo / 3600);
    } else {
      unit = 'jour';
      time = parseInt(secondsAgo / 86400);
    }

    return time + ' ' + unit + (time > 1 ? 's' : '');
  };
})
.filter('localDate', function () {
  return function (input) {
    return new Date(input).toLocaleString();
  };
})
.filter('naturalSortBy', function () {
  function chunkify(t) {
    var tz = new Array();
    var x = 0, y = -1, n = 0, i, j;

    while (i = (j = t.charAt(x++)).charCodeAt(0)) {
      var m = (i == 46 || (i >=48 && i <= 57));
      if (m !== n) {
        tz[++y] = "";
        n = m;
      }
      tz[y] += j;
    }
    return tz;
  }

  return function (array, field) {
    if (!angular.isArray(array) || !field) { return array; }
    var results = [];

    return array.sort(function (a, b) {
      var aa = chunkify(a[field].toLowerCase());
      var bb = chunkify(b[field].toLowerCase());

      for (x = 0; aa[x] && bb[x]; x++) {
        if (aa[x] !== bb[x]) {
          var c = Number(aa[x]), d = Number(bb[x]);
          if (c == aa[x] && d == bb[x]) {
            return c - d;
          } else return (aa[x] > bb[x]) ? 1 : -1;
        }
      }
      return aa.length - bb.length;
    });
  };
});
