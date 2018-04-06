Vue.component("app-input", {
  props: ["title","formats","files","id","loaded","url","component","readonly","EntID"],
  template: `<div>
    <div class="docBlock" v-if="!readonly || (readonly && loaded) " >
    <span>{{title}}</span>
      <div class="form-group pull-center">
        <input v-if="!readonly"
          ref="fileInput"
          @change="flsChange"
          :accept="formats"
          type="file">
        <button v-if="!readonly" :disabled="uplBtnStat" class="btn btn-danger" v-on:click="uplHandler">Загрузить</button>
        <template v-if="loaded">
        <a class="btn btn-danger" target="_blank"
        :href="url+'?component='+component+'&action=get_uploaded_list&EntID='+EntID+'&doc_id='+id">Открыть загруженный документ</a>
        </template>
        </div>
        <b-progress :value="uploadPercentage" :max="max" show-progress animated></b-progress>
        <transition name="bounce">
            <b-alert
                  :show="dismissCountDown"
                  dismissible
                  :variant="alertColor"
                  @dismissed="dismissCountdown=0"
                  @dismiss-count-down="countDownChanged">
                  <h3>{{status==1?'':'Error! '}} {{msg}}</h3>
            <h6>Это оповещение будет скрыто автоматически через {{dismissCountDown}} сек...</h6>
          </b-alert>
        </transition>
  </div>
	  </div>`,
  data() {
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
    changeMessage:  function(e) {
      this.message = e.target.value;
      this.$emit("messageChanged", this.message);
    },
    flsChange: function(e) {
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
    uplHandler(e) {
      this.uplBtnStat = true; //  console.log(1,this,2,e)
      var head = {headers: {"Accept": "application/json","Content-Type": "application/octet-stream"},
        onUploadProgress: function(progressEvent) {
          if (progressEvent.loaded > 0 && progressEvent.total > 0) {
            this.uploadPercentage = parseInt(
              Math.round(progressEvent.loaded * 100 / progressEvent.total)
            );
          } else {this.uploadPercentage = 0;}
        }.bind(this)
      };
      var that = this;
      var file = this.$refs.fileInput.files[0]; //this.file
      var filename = this.$refs.fileInput.files[0].name; //this.file.name

      var fd = new FormData();
      fd.append("file", file, filename);
      fd.append("id", that.id);
      fd.append("EntID", that.EntID);
      axios
        .post(that.url + "?component=" + that.component + "&action=post", fd, head)
        .then(function(res) {
          //console.log("success=>",res);
          that.msg = res.data.msg;
          that.status = res.data.status;
          that.showAlert();
          that.alertColor = "success";
          that.$emit("uploaded");
        })
        .catch(function(e) {
          console.info("catch->", e);
          that.status = 0;
          that.msg = "Ошибка при передаче файла. Проверьте соединение.";
          that.showAlert();
          that.alertColor = "danger";
          setTimeout(function() {
            that.uploadPercentage = 0;
            that.uplBtnStat = false;
          }, 1000);
        });
    },
    countDownChanged(dismissCountDown) {
		this.dismissCountDown = dismissCountDown;},
    showAlert() {
		this.dismissCountDown = this.dismissSecs;}
  }
});


////////////////////////////////////

Vue.component("app-upload", {
  props: ["component", "url", "formats", "readonly"],
  template: `
  <div>
	<div class="pull-center">
		<button
		onclick="javascript:this"
		class="btn"
		@click="btn_zagruzka"
		:class="{'btn-dark': seen, 'btn-danger': !seen}">
				<i class="fas fa-paperclip"></i>
				{{btn_upload_text}}
			</button>
		<transition-group name="bounce"
		>
			<div v-if="seen" v-for="(file, index) in files"
				:key="index">
			<p is="app-input"
				:url="url"
				:component="component"
				:readonly="readonly"
				:EntID="EntID"
				:title="file.title"
				:id="index.replace('id','')"
				:loaded="file.loaded"
				:formats="formats"
				:key2="index"
				@uploaded="uploadedHandler"
			></p>
		</div>
		</transition-group>
	</div>
</div>`,
  data() {
    return { seen: false, files: [], msg: "", status: "", EntID: "" };
  },
  computed: {
    btn_upload_text() {
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
    btn_zagruzka() {
      this.seen = !this.seen;
      if (this.component == "sudozahod") {
        var btn = document.querySelector(".btn-zahod");
        if (btn) {btn.click();}
      }
      if (this.component == "sudoothod") {
        var btn = document.querySelector(".btn-othod");
        if (btn) {btn.click();}
      }
    },
    listView: function() {
      var that = this;
      axios
        .get(that.url + "?component=" + that.component + "&get_list=1")
        .then(function(res) {
          that.files = eval("(" + res.data + ")"); //парсим текст в объект;
          //console.log('that.files===>>',that.files);
        })
        .then(function() {
          that.uploaded_list();
        })
        .catch(function(e) {
          console.info("catch->", e);
          that.status = 0;
          that.msg =
            "Ошибка при проверке уже загруженных документов. Проверьте соединение.";
          that.showAlert();
          that.alertColor = "danger";
        });
    },
    uploaded_list() {
      var that = this;
      axios.get(that.url +"?component=" +that.component +"&action=get_uploaded_list&EntID="+that.EntID)
        .then(function(res) {//console.log('ОТВЕТ2',res.data);
          if (res.data.msg != null) {
            var uploadedDocs = res.data.msg.split(",");
            // console.log('otvet->',uploadedDocs, 'that.files=>',that.files);
            uploadedDocs.forEach(function(e) {
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
    uploadedHandler: function(e, ee) {
      console.log(this, e, ee);
      this.listView();
    }
  },
  mounted() {
    var params = window.location.search
      .replace("?", "")
      .split("&")
      .reduce(function(p, e) {
        var a = e.split("=");
        p[decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
        return p;
      }, {});
    this.EntID = params["EntID"];
    this.listView();
  }
});


////////////////////////////////////



var tpl = `<div><app-upload :readonly="readonly" :url="url" :formats="formats" :component="component">
			</app-upload></div>`;


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


//  > USAGE => 	 <div align="center" id="app_1"></div> 
/*
        selector = "#app_1";
        component = "sudozahod";
        readonly = 0;
        url = "//192.168.202.103/seaport_new/doc_upload.php"
        formats = ".pdf";
        newVue(selector, component, readonly, url, formats);
        newVue("#app_2", "sudozahod", 0, url, formats);
*/