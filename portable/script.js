"use strict";

Vue.component("app-input", {
  props: ["title", "formats", "files", "id", "loaded", "url", "component", "readonly", "candelete", "EntID"],
  template: "<div>\n    <div class=\"docBlock\" v-if=\"!readonly || (readonly && loaded) \" >\n    <span>{{title}}</span>\n      <div class=\"form-group pull-center\">\n        <input v-if=\"!readonly\"\n          ref=\"fileInput\"\n          @change=\"flsChange\"\n          :accept=\"formats\"\n          type=\"file\">\n          <button v-if=\"!readonly\" :disabled=\"uplBtnStat\" class=\"btn btn-danger\" v-on:click=\"uplHandler\">\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C</button>\n          <template v-if=\"loaded\">\n          <a class=\"btn btn-success\" target=\"_blank\" :href=\"url+'?component='+component+'&action=get_uploaded_list&EntID='+EntID+'&doc_id='+id\">\n            \u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043D\u044B\u0439 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\n          </a>\n          <button :disabled=\"!candelete\" class=\"btn btn-info\" @click=\"deleteDoc\">\n             \u0423\u0434\u0430\u043B\u0438\u0442\u044C\n          </button>\n        </template>\n        </div>\n        <b-progress :value=\"uploadPercentage\" :max=\"max\" show-progress animated></b-progress>\n        <transition name=\"bounce\">\n            <b-alert style=\"text-align:center\"\n                  :show=\"dismissCountDown\"\n                  dismissible\n                  :variant=\"alertColor\"\n                  @dismissed=\"dismissCountDown = 0\"  \n                  @dismiss-count-down=\"countDownChanged\">\n                  <h3>\n                  <b-badge variant=\"success\">{{status==1?'':'Error! '}} {{msg}} </b-badge>\n                  <br>\n            <b-badge variant=\"Light\" style=\"font-size:14px;color:black\">\u042D\u0442\u043E \u043E\u043F\u043E\u0432\u0435\u0449\u0435\u043D\u0438\u0435 \u0431\u0443\u0434\u0435\u0442 \u0441\u043A\u0440\u044B\u0442\u043E \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0447\u0435\u0440\u0435\u0437 {{dismissCountDown}} \u0441\u0435\u043A...</b-badge></b-badge></h3>\n          </b-alert>\n        </transition>\n  </div>\n\t  </div>",
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
    deleteDoc: function deleteDoc(e) {
      console.log("this", this, "e", e);
      var that = this;
      axios.get(that.url + "?component=" + that.component + "&action=delete_doc&id=" + that.id + "&EntID=" + that.EntID).then(function (res) {
        console.log("success=>", res);
        that.msg = res.data.msg;
        that.status = res.data.status;
        that.alertColor = "success";
        that.showAlert();
        that.$emit("uploaded");
      }).catch(function (e) {
        console.info("catch->", e);
        that.status = 0;
        that.msg = "Ошибка при удалении. Проверьте соединение.";
        that.showAlert();
        that.alertColor = "danger";
      });
    },

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
      var head = {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/octet-stream"
        },
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
  props: ["component", "url", "formats", "readonly", "candelete", "EntID"],
  template: "\n  <div>\n\t<div v-if=\"upBtnView\" class=\"pull-center\">\n    <button\n    class=\"btn\"\n\t\t@click=\"btn_zagruzka\"\n\t\t:class=\"{\n      'btn-primary': seen, \n      'btn-danger': (!seen&&!readonly),\n      'btn-info': (!seen&&readonly)\n    }\"> <i class=\"glyphicon glyphicon-share\"></i>\n        <i class=\"fas\"\n          :class=\"{\n            'fa-paperclip':!seen,\n            'fa-times':seen}\"></i>\n\t\t\t\t{{btn_upload_text}}\n\t\t\t</button>\n\t\t<transition-group name=\"bounce\"\n\t\t>\n\t\t\t<div v-if=\"seen\" v-for=\"(file, index) in files\"\n\t\t\t\t:key=\"index\">\n      <p is=\"app-input\"\n\t\t\t\t:url=\"url\"\n\t\t\t\t:component=\"component\"\n        :readonly=\"readonly\"\n        :candelete=\"candelete\"\n\t\t\t\t:EntID=\"EntID\"\n\t\t\t\t:title=\"file.title\"\n\t\t\t\t:id=\"index.replace('id','')\"\n\t\t\t\t:loaded=\"file.loaded\"\n\t\t\t\t:formats=\"formats\"\n\t\t\t\t:key2=\"index\"\n        @uploaded=\"uploadedHandler\" \n\t\t\t></p>\n\t\t</div>\n\t\t</transition-group>\n\t</div>\n</div>",
  data: function data() {
    return { seen: false, files: [], msg: "", status: "", upBtnView: false };
  },

  computed: {
    btn_upload_text: function btn_upload_text() {
      if (!this.seen && !this.readonly) {
        return "Загрузить документы"; //на " + this.component;
      } else if (!this.seen && this.readonly) {
        return "Показать документы"; // на " + this.component;
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
        if (!that.readonly) {
          //тестим - есть ли что-то в списке уже загруженных;)
          that.upBtnView = Object.keys(that.files).length > 0 ? true : false;
        }
      }).then(function () {
        that.uploaded_list();
      }).catch(function (e) {
        console.info("catch->", e);
        //that.status = 0;
        //that.msg = "Ошибка при проверке уже загруженных документов. Проверьте соединение.";
        //that.showAlert();
        //that.alertColor = "danger";
      });
    },
    uploaded_list: function uploaded_list() {
      var that = this;
      var group = 0;
      axios.get(that.url + "?component=" + that.component + "&action=get_uploaded_list&EntID=" + that.EntID).then(function (res) {
        //console.log('ОТВЕТ2',res.data);
        if (res.data.msg != null) {
          var uploadedDocs = res.data.msg.split(",");
          // console.log('otvet->',uploadedDocs, 'that.files=>',that.files);
          uploadedDocs.forEach(function (e) {
            // console.log('uploadedDOCS=>>>',e,that.files)
            try {
              that.files["id" + e].loaded = 1;
              that.upBtnView = true; //есть что-то в списке уже загруженных;)
            } catch (err) {
              if (group == 0) {
                console.groupCollapsed("=>uploaded_list:");
              }
              group = 1;
              console.info("=>File loaded ERRR => ", "=>uploadedDocs:", uploadedDocs, "\n", "=>e:", e, "\n", "=>that.files:", that.files, "\n", "=>that:", that, "\n", "=>err:", err);
            } //console.log('that.files["id"+e]=>',that.files["id"+e])
          });
        }
      });
      if (group != 0) {
        console.groupEnd();
      }
    },

    uploadedHandler: function uploadedHandler(e, ee) {
      console.log(this, e, ee);
      this.listView();
    }
  },
  mounted: function mounted() {
    this.listView();
  }
});

////////////////////////////////////


var tpl = "<div><app-upload :EntID=\"EntID\" :readonly=\"readonly\" :candelete=\"candelete\" :url=\"url\" :formats=\"formats\" :component=\"component\">\n\t\t\t</app-upload></div>";

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

function newVue(sel, comp, read, del, ur, frmt, EntID) {
  new Vue({
    el: sel,
    template: tpl,
    component: "app-upload",
    data: {
      component: comp,
      readonly: read,
      candelete: del,
      url: ur,
      formats: frmt,
      EntID: EntID
    }
  });
}

//  > USAGE 4demo => 	 <div align="center" id="app_1"></div> 
var selector = "#app_1",
    component = "sudozahod",
    readonly = 0,
    canDelete = 1,
    url = "//192.168.202.103/seaport_new/doc_upload.php",
    formats = ".pdf",
    EntID = 123456;
newVue(selector, component, readonly, canDelete, url, formats, EntID); //так;
newVue("#app_2", "sudozahod", 1, 0, url, formats, EntID); //либо так;
