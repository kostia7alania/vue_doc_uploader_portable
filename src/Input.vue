<template>
<div>
    <div class="docBlock" v-if="!readonly ||
      (readonly && (loaded || docs4postUpload.includes(key2)) )
      " >
    <span>{{title}} <span style="color:red"></span> </span>
       <div class="form-group pull-center">
        <template v-if="!readonly || (docs4postUpload.includes(key2) && !loaded)">
          <input ref="fileInput" @change="flsChange" :accept="formats" type="file" />
          <button :disabled="uplBtnStat" class="btn btn-danger" @click="uplHandler">Загрузить</button>
        </template>

        <template v-if="loaded">
          <a class="btn btn-success" target="_blank" :href="url+'?component='+component+'&action=get_uploaded_list&EntID='+EntID+'&doc_id='+id">
            Открыть загруженный документ
          </a>
          <b-btn v-if="candelete" class="btn btn-info" @click="go_modal('del')">Удалить</b-btn>

          <b-form-checkbox v-if="isCapitan" @change="toggleAll"
            v-model="checked_local" >{{ switches_text }}
          </b-form-checkbox>


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

	  </div>
</template>

<script>
export default {
  props: ["title","formats","files","id","loaded","url","component","readonly","candelete","EntID","key2","docs4postUpload", "isCapitan", 'confirm'],
  data(){ return {
      max: 100,
      file: undefined,
      uploadPercentage: 0,
      status: "",
      msg: "",
      dismissSecs: 10,
      dismissCountDown: false,
      alertColor: "warning",
      uplBtnStat: true,
      checked_local:null,
    }
  },
  watch:{
    confirm(neww,old) {
      if(neww!=old) {
        this.checked_local = this.confirm;
        this.$forceUpdate();
      }
    }
  },
  mounted() {
    this.checked_local = this.confirm
      EventBus.$on("cancelHandler", obj => {
        if( obj.title == this.title && obj.key2==this.key2.replace('id','')) {
          this.checked_local = this.confirm
          this.$forceUpdate();
          console.log('event bus!!')
        }
      });
  },
  computed:{
    switches_text(){return this.checked_local?'подтвержден':'подтвердить'}
  },
  methods: {
    toggleAll(e){
      console.log('toggleAll!!',e)
      let bool = e;
    if(e=='object')  bool = e.target.checked
     bool?this.go_modal('sign'):this.go_modal('unsign')
    },
    go_modal(modal_mode) {
    //  console.log('delDocName=>', delDocName, 'delDocId=>', delDocId);
      this.uploadPercentage = this.dismissCountDown = 0;
      this.$emit('go_modal', this.title, this.key2.replace('id',''), modal_mode);
    },

    changeMessage (e) {
      this.message = e.target.value;
      this.$emit("messageChanged", this.message);
    },
    flsChange (e) {
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
      const head = {
        headers: { Accept: "application/json", "Content-Type": "application/octet-stream" },
        onUploadProgress: progressEvent => {
          if (progressEvent.loaded > 0 && progressEvent.total > 0) {
            this.uploadPercentage = parseInt(
              Math.round(progressEvent.loaded * 100 / progressEvent.total)
            );
          } else {
            this.uploadPercentage = 0;
          }
        }
      };
      const file = this.$refs.fileInput.files[0]; //this.file
      const filename = this.$refs.fileInput.files[0].name; //this.file.name

      const fd = new FormData();
      fd.append("file", file, filename);
      fd.append("id", this.id);
      fd.append("EntID", this.EntID);
      axios
        .post(
          this.url + "?component=" + this.component + "&action=post",
          fd,
          head
        )
        .then( res => {
          //console.log("success=>",res);
          this.msg = res.data.msg;
          this.status = res.data.status;
          this.showAlert();
          this.alertColor = "success";
          this.$emit("uploaded");
        })
        .catch( e => {
          console.info("catch->", e);
          this.status = 0;
          this.msg = "Ошибка при передаче файла. Проверьте соединение.";
          this.showAlert();
          this.alertColor = "danger";
          setTimeout(() => {
            this.uploadPercentage = 0;
            this.uplBtnStat = false;
          }, 1000);
        });
    },
    countDownChanged(dismissCountDown) { this.dismissCountDown = dismissCountDown; },
    showAlert() { this.dismissCountDown = this.dismissSecs; }
  }
}
</script>
