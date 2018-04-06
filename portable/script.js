﻿"use strict";

Vue.component("app-input", {
  props: ["title", "formats", "files", "id", "loaded", "url", "component", "readonly", "EntID"],
  template: "<div>\n    <div class=\"docBlock\" v-if=\"!readonly || (readonly && loaded) \" >\n    <span>{{title}}</span>\n      <div class=\"form-group pull-center\">\n        <input v-if=\"!readonly\"\n          ref=\"fileInput\"\n          @change=\"flsChange\"\n          :accept=\"formats\"\n          type=\"file\">\n        <button v-if=\"!readonly\" :disabled=\"uplBtnStat\" class=\"btn btn-danger\" v-on:click=\"uplHandler\">\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C</button>\n        <template v-if=\"loaded\">\n        <a class=\"btn btn-danger\" target=\"_blank\"\n        :href=\"url+'?component='+component+'&action=get_uploaded_list&EntID='+EntID+'&doc_id='+id\">\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043D\u044B\u0439 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442</a>\n        </template>\n        </div>\n        <b-progress :value=\"uploadPercentage\" :max=\"max\" show-progress animated></b-progress>\n        <transition name=\"bounce\">\n            <b-alert\n                  :show=\"dismissCountDown\"\n                  dismissible\n                  :variant=\"alertColor\"\n                  @dismissed=\"dismissCountdown=0\"\n                  @dismiss-count-down=\"countDownChanged\">\n                  <h3>{{status==1?'':'Error! '}} {{msg}}</h3>\n            <h6>\u042D\u0442\u043E \u043E\u043F\u043E\u0432\u0435\u0449\u0435\u043D\u0438\u0435 \u0431\u0443\u0434\u0435\u0442 \u0441\u043A\u0440\u044B\u0442\u043E \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0447\u0435\u0440\u0435\u0437 {{dismissCountDown}} \u0441\u0435\u043A...</h6>\n          </b-alert>\n        </transition>\n  </div>\n\t  </div>",
  data: function data() {
    return {
      max: 100,
      file: undefined,
      uploadPercentage: 0,
      status: "",
      msg: "",
      dismissSecs: 10,
      dismissCountDown: false,
      alertColor: "warning",
      uplBtnStat: true
    };
  },

  methods: {
    changeMessage: function changeMessage(e) {
      this.message = e.target.value;
      this.$emit("messageChanged", this.message);
    },
    flsChange: function flsChange(e) {
      if (e.target.files[0]) {
        this.file = e.target.files[0];
        //console.log(this,e,this.file)
      } else {
        this.file = undefined;
      }
      if (this.file != undefined) {
        this.uplBtnStat = false;
      } else {
        this.uplBtnStat = true;
      }
    },
    uplHandler: function uplHandler(e) {
      this.uplBtnStat = true; //  console.log(1,this,2,e)
      var head = { headers: { "Accept": "application/json", "Content-Type": "application/octet-stream" },
        onUploadProgress: function (progressEvent) {
          if (progressEvent.loaded > 0 && progressEvent.total > 0) {
            this.uploadPercentage = parseInt(Math.round(progressEvent.loaded * 100 / progressEvent.total));
          } else {
            this.uploadPercentage = 0;
          }
        }.bind(this)
      };
      var that = this;
      var file = this.$refs.fileInput.files[0]; //this.file
      var filename = this.$refs.fileInput.files[0].name; //this.file.name

      var fd = new FormData();
      fd.append("file", file, filename);
      fd.append("id", that.id);
      fd.append("EntID", that.EntID);
      axios.post(that.url + "?component=" + that.component + "&action=post", fd, head).then(function (res) {
        //console.log("success=>",res);
        that.msg = res.data.msg;
        that.status = res.data.status;
        that.showAlert();
        that.alertColor = "success";
        that.$emit("uploaded");
      }).catch(function (e) {
        console.info("catch->", e);
        that.status = 0;
        that.msg = "Ошибка при передаче файла. Проверьте соединение.";
        that.showAlert();
        that.alertColor = "danger";
        setTimeout(function () {
          that.uploadPercentage = 0;
          that.uplBtnStat = false;
        }, 1000);
      });
    },
    countDownChanged: function countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown;
    },
    showAlert: function showAlert() {
      this.dismissCountDown = this.dismissSecs;
    }
  }
});

////////////////////////////////////

Vue.component("app-upload", {
  props: ["component", "url", "formats", "readonly"],
  template: "\n  <div>\n\t<div class=\"pull-center\">\n\t\t<button\n\t\tonclick=\"javascript:this\"\n\t\tclass=\"btn\"\n\t\t@click=\"btn_zagruzka\"\n\t\t:class=\"{'btn-dark': seen, 'btn-danger': !seen}\">\n\t\t\t\t<i class=\"fas fa-paperclip\"></i>\n\t\t\t\t{{btn_upload_text}}\n\t\t\t</button>\n\t\t<transition-group name=\"bounce\"\n\t\t>\n\t\t\t<div v-if=\"seen\" v-for=\"(file, index) in files\"\n\t\t\t\t:key=\"index\">\n\t\t\t<p is=\"app-input\"\n\t\t\t\t:url=\"url\"\n\t\t\t\t:component=\"component\"\n\t\t\t\t:readonly=\"readonly\"\n\t\t\t\t:EntID=\"EntID\"\n\t\t\t\t:title=\"file.title\"\n\t\t\t\t:id=\"index.replace('id','')\"\n\t\t\t\t:loaded=\"file.loaded\"\n\t\t\t\t:formats=\"formats\"\n\t\t\t\t:key2=\"index\"\n\t\t\t\t@uploaded=\"uploadedHandler\"\n\t\t\t></p>\n\t\t</div>\n\t\t</transition-group>\n\t</div>\n</div>",
  data: function data() {
    return { seen: false, files: [], msg: "", status: "", EntID: "" };
  },

  computed: {
    btn_upload_text: function btn_upload_text() {
      if (!this.seen && !this.readonly) {
        return "Загрузить документы на " + this.component;
      } else if (!this.seen && this.readonly) {
        return "Показать документы на " + this.component;
      } else {
        return "Скрыть";
      }
    }
  },
  methods: {
    btn_zagruzka: function btn_zagruzka() {
      this.seen = !this.seen;
      if (this.component == "sudozahod") {
        var btn = document.querySelector(".btn-zahod");
        if (btn) {
          btn.click();
        }
      }
      if (this.component == "sudoothod") {
        var btn = document.querySelector(".btn-othod");
        if (btn) {
          btn.click();
        }
      }
    },

    listView: function listView() {
      var that = this;
      axios.get(that.url + "?component=" + that.component + "&get_list=1").then(function (res) {
        that.files = eval("(" + res.data + ")"); //парсим текст в объект;
        //console.log('that.files===>>',that.files);
      }).then(function () {
        that.uploaded_list();
      }).catch(function (e) {
        console.info("catch->", e);
        that.status = 0;
        that.msg = "Ошибка при проверке уже загруженных документов. Проверьте соединение.";
        that.showAlert();
        that.alertColor = "danger";
      });
    },
    uploaded_list: function uploaded_list() {
      var that = this;
      axios.get(that.url + "?component=" + that.component + "&action=get_uploaded_list&EntID=" + that.EntID).then(function (res) {
        //console.log('ОТВЕТ2',res.data);
        if (res.data.msg != null) {
          var uploadedDocs = res.data.msg.split(",");
          // console.log('otvet->',uploadedDocs, 'that.files=>',that.files);
          uploadedDocs.forEach(function (e) {
            // console.log('uploadedDOCS=>>>',e,that.files)
            try {
              that.files["id" + e].loaded = 1;
            } catch (e) {
              console.info("file loaded ERRR => ", e, that);
            }
            //console.log('that.files["id"+e]=>',that.files["id"+e])
          });
        }
      });
    },

    uploadedHandler: function uploadedHandler(e, ee) {
      console.log(this, e, ee);
      this.listView();
    }
  },
  mounted: function mounted() {
    var params = window.location.search.replace("?", "").split("&").reduce(function (p, e) {
      var a = e.split("=");
      p[decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
      return p;
    }, {});
    this.EntID = params["EntID"];
    this.listView();
  }
});

////////////////////////////////////


var tpl = "<div><app-upload :readonly=\"readonly\" :url=\"url\" :formats=\"formats\" :component=\"component\">\n\t\t\t</app-upload></div>";

/*

Vue.component("App_sudozahod", {
  template: `<div><app-upload
      :readonly="readonly"
      :url="url"
      :formats="formats"
	  :component="component"></app-upload>
	  </div>`,
  data() {
    return {
      component: "sudoothod",
      readonly: false,
      url: "//192.168.202.103/seaport_new/doc_upload.php",
      formats: ".pdf"
    };
  }
});



new Vue({el: "#app_2",template: "<App_sudozahod></App_sudozahod>"});
new Vue({el: "#app_3",template: "<App_sudozahod></App_sudozahod>"});
new Vue({el: "#app_4",template: "<App_sudozahod></App_sudozahod>"});

	new Vue({
    el: "#app_1",
    template: tpl,
    component: "app-upload",
    data: {
      component: "sudozahod",
      readonly: false,
      url: "//192.168.202.103/seaport_new/doc_upload.php",
      formats: ".pdf"
    }
  });
  */

function newVue(sel, comp, read, ur, frmt) {
  new Vue({
    el: sel,
    template: tpl,
    component: "app-upload",
    data: {
      component: comp,
      readonly: read,
      url: ur,
      formats: frmt
    }
  });
}

//  > USAGE =>
/*
        selector = "#app_1";
        component = "sudozahod";
        readonly = 0;
        url = "//192.168.202.103/seaport_new/doc_upload.php"
        formats = ".pdf";
        newVue(selector, component, readonly, url, formats);
        newVue("#app_2", "sudozahod", 0, url, formats);
*/