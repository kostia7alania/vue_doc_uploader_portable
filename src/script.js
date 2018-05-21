Vue.component("app-input", {
  props: [
    "title",
    "formats",
    "files",
    "id",
    "loaded",
    "url",
    "component",
    "readonly",
    "candelete",
    "EntID",
    "key2",
    "docs4postUpload"
  ],
  template: `<div> 
    <div class="docBlock" v-if="!readonly || 
      (readonly && (loaded || docs4postUpload.includes(key2)) )
      " >
    <span>{{title}}</span> 

       <div class="form-group pull-center">

        <template v-if="!readonly || (docs4postUpload.includes(key2) && !loaded)"> 
          <input
            ref="fileInput"
            @change="flsChange"
            :accept="formats"
            type="file"
          />
          <button :disabled="uplBtnStat" class="btn btn-danger" @click="uplHandler">Загрузить</button>
        </template>

        <template v-if="loaded">
          <a class="btn btn-success" target="_blank" :href="url+'?component='+component+'&action=get_uploaded_list&EntID='+EntID+'&doc_id='+id">
            Открыть загруженный документ
          </a>
          <button v-if="candelete" :disabled="!candelete" class="btn btn-info" @click="deleteDoc">
             Удалить
          </button>
        </template>
        </div>
        <b-progress :value="uploadPercentage" :max="max" show-progress animated></b-progress>
        <transition name="bounce">
            <b-alert style="text-align:center"
                  :show="dismissCountDown"
                  dismissible
                  :variant="alertColor"
                  @dismissed="dismissCountDown = 0"  
                  @dismiss-count-down="countDownChanged">
                  <h3>
                  <b-badge variant="success">{{status==1?'':'Error! '}} {{msg}} </b-badge>
                  <br>
            <b-badge variant="Light" style="font-size:14px;color:black">Это оповещение будет скрыто автоматически через {{dismissCountDown}} сек...</b-badge></b-badge></h3>
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
    deleteDoc(e) {
      console.log("this", this, "e", e);
      var that = this;
      axios
        .get(
          that.url +
            "?component=" +
            that.component +
            "&action=delete_doc&id=" +
            that.id +
            "&EntID=" +
            that.EntID
        )
        .then(function(res) {
          console.log("success=>", res);
          that.msg = res.data.msg;
          that.status = res.data.status;
          that.alertColor = "success";
          that.showAlert();
          that.$emit("uploaded");
          that.uploadPercentage = 0;
        })
        .catch(function(e) {
          console.info("catch->", e);
          that.status = 0;
          that.msg = "Ошибка при удалении. Проверьте соединение.";
          that.showAlert();
          that.alertColor = "danger";
        });
    },
    changeMessage: function(e) {
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
      var head = {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/octet-stream"
        },
        onUploadProgress: function(progressEvent) {
          if (progressEvent.loaded > 0 && progressEvent.total > 0) {
            this.uploadPercentage = parseInt(
              Math.round(progressEvent.loaded * 100 / progressEvent.total)
            );
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
      axios
        .post(
          that.url + "?component=" + that.component + "&action=post",
          fd,
          head
        )
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
      this.dismissCountDown = dismissCountDown;
    },
    showAlert() {
      this.dismissCountDown = this.dismissSecs;
    }
  }
});


////////////////////////////////////

Vue.component("app-upload", {
  props: ["component", "url", "formats", "readonly", "candelete", "EntID", "docs4postUpload"],
  template: `
  <div>
	<div v-if="upBtnView" class="pull-center">
    <button
    class="btn"
		@click="btn_zagruzka"
		:class="{
      'btn-primary': seen, 
      'btn-danger': (!seen&&!readonly),
      'btn-info': (!seen&&readonly)
    }"> <i class="glyphicon glyphicon-share"></i>
        <i class="fas"
          :class="{
            'fa-paperclip':!seen,
            'fa-times':seen}"></i>
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
        :candelete="candelete"
				:EntID="EntID"
				:title="file.title"
				:id="index.replace('id','')"
				:loaded="file.loaded"
				:formats="formats"
        :key2="index"
        :docs4postUpload="docs4postUpload"
        @uploaded="uploadedHandler" 
			></p>
		</div>
		</transition-group>
	</div>
</div>`,
  data() {
    return { seen: false, files: [], msg: "", status: "", upBtnView: false };
  },
  computed: {
    btn_upload_text() {
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
    btn_zagruzka() {
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
    listView: function() {
      var that = this;
      axios
        .get(that.url + "?component=" + that.component + "&get_list=1")
        .then(function(res) {
          that.files = eval("(" + res.data + ")"); //парсим текст в объект;
          //console.log('that.files===>>',that.files);
          if (!that.readonly) {
            //тестим - есть ли что-то в списке уже загруженных;)
            that.upBtnView = Object.keys(that.files).length > 0 ? true : false;
          }
        })
        .then(function() {
          that.uploaded_list();
        })
        .catch(function(e) {
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
      axios
        .get(
          that.url +
            "?component=" +
            that.component +
            "&action=get_uploaded_list&EntID=" +
            that.EntID
        )
        .then(function(res) {
          //console.log('ОТВЕТ2',res.data);
          if (res.data.msg != null) {
            var uploadedDocs = res.data.msg.split(",");
            // console.log('otvet->',uploadedDocs, 'that.files=>',that.files);
            uploadedDocs.forEach(function(e) {
              // console.log('uploadedDOCS=>>>',e,that.files)
              try {
                that.files["id" + e].loaded = 1;
                that.upBtnView = true; //есть что-то в списке уже загруженных;)
              } catch (err) {
                if (group == 0) {
                  console.groupCollapsed("=>uploaded_list:");
                }
                group = 1;
                console.info(
                  "=>File loaded ERRR => ",
                  "=>uploadedDocs:",
                  uploadedDocs,
                  "\n",
                  "=>e:",
                  e,
                  "\n",
                  "=>that.files:",
                  that.files,
                  "\n",
                  "=>that:",
                  that,
                  "\n",
                  "=>err:",
                  err
                );
              } //console.log('that.files["id"+e]=>',that.files["id"+e])
            });
          }
        });
      if (group != 0) {
        console.groupEnd();
      }
    },

    uploadedHandler: function(e, ee) {
      console.log(this, e, ee);
      this.listView();
    }
  },
  mounted() {
    this.listView();
  }
});


////////////////////////////////////



var tpl = `<div><app-upload :EntID="EntID" :readonly="readonly" :docs4postUpload="docs4postUpload" :candelete="candelete" :url="url" :formats="formats" :component="component">
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
 
function newVue(sel, comp, read = 1, ur, frmt, EntID, del = 0, docs4postUpload = "") {
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
      EntID: EntID,
      docs4postUpload: docs4postUpload.split(',')
    }
  });
}


//  > USAGE 4demo => 	 <div align="center" id="app_1"></div> 
 /* let
        selector = "#app_1",
        component = "sudozahod",
        readonly = 0,
        canDelete = 1,
        url = "//192.168.202.103/seaport_new/doc_upload.php",
        formats = ".pdf",
        EntID = 123456;
        newVue(selector, component, readonly, canDelete, url, formats, EntID); //так;
        newVue("#app_2", "sudozahod", 1, 0, url, formats, EntID);//либо так;
  
 */