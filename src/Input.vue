<template>
<div> 
    <div class="docBlock" v-if="!readonly || 
      (readonly && (loaded || docs4postUpload.includes(key2)) )
      " >
    <span>{{title}}</span> 

       <div class="form-group pull-center"> 
        <template v-if="!readonly || (docs4postUpload.includes(key2) && !loaded)"> 
          <input ref="fileInput" @change="flsChange" :accept="formats" type="file" />
          <button :disabled="uplBtnStat" class="btn btn-danger" @click="uplHandler">Загрузить</button>
        </template>

        <template v-if="loaded">
          <a class="btn btn-success" target="_blank" :href="url+'?component='+component+'&action=get_uploaded_list&EntID='+EntID+'&doc_id='+id">
            Открыть загруженный документ
          </a>

          <b-btn v-b-modal.modalPopover v-if="candelete" class="btn btn-info"  @click="del_modal(title,key2)" 
          >Удалить</b-btn> 
     
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
  props: ["title","formats","files","id","loaded","url","component","readonly","candelete","EntID","key2","docs4postUpload"],
  data(){ return {       
      max: 100,
      file: undefined,
      uploadPercentage: 0,
      status: "",
      msg: "",
      dismissSecs: 10,
      dismissCountDown: false,
      alertColor: "warning",
      uplBtnStat: true} 
  },
  methods: {
    del_modal(delDocName, delDocId) {
    //  console.log('delDocName=>', delDocName, 'delDocId=>', delDocId);
      this.uploadPercentage = this.dismissCountDown = 0;
      this.$emit('docDelConfirm', delDocName, delDocId);
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
  },
  mounted: function () {} 
}
</script>