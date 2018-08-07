<template>
  <div>
    <div v-if="upBtnView" class="pull-center">
      <button class="btn" @click="btn_zagruzka" :class="{ 'btn-primary': seen,  
                                                          'btn-danger': (!seen&&!readonly),
                                                          'btn-info': (!seen&&readonly)
      }"> <i class="glyphicon glyphicon-share"></i>
          <i class="fas" :class="{ 'fa-paperclip':!seen, 'fa-times':seen}"></i>
          {{btn_upload_text}}
      </button>
      <transition-group name="bounce">
        <div v-if="loading==0 && seen && !(disabledDocIds.includes(index))" v-for="(file, index) in files" :key="index">
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
          @docDelConfirm="docDelConfirm"
        ></p>
        <h3 v-if="loading==1">Loading...</h3>
      </div>
      </transition-group>
    </div> 
          <b-modal 
              ok-title="Подтверждаю"
              cancel-title="Отмена"
              :centered="true"
              @ok="deleteDoc" id="modalPopover" title="Вы действительно хотите удалить документ?">
            <p class="pull-center"><b>{{delDocName}}</b></p>
            <hr>          
            <h4 class="pull-center" >Подтвердите удаление</h4> 
          </b-modal>   
  </div>
</template> 

<script>    
import input from "./Input.vue";  

export default {
 components: {'app-input': input},
  props: ["component", "url", "formats", "readonly", "candelete", "EntID", "docs4postUpload", 'disabledDocIds'],
  data(){       
     return {loading: 0, delDocName:'', delDocId:'', seen: false, files: [], msg: "", status: "", upBtnView: false };
  },
   computed: {
    btn_upload_text() {
      if (!this.seen && !this.readonly) {
        return "Загрузить документы"; //на " + this.component;
      } else if (!this.seen && this.readonly) {
        return "Показать документы"; // на " + this.component;
      } else { return "Скрыть"; }
    }
  },
  methods: {
      deleteDoc() { 
        axios
          .get(this.url + "?component=" + this.component + "&action=delete_doc&id=" + this.delDocId +"&EntID=" +this.EntID)
          .then(res=>{ // console.log(res);
            this.listView();
          })
          .catch(function (e) { console.log(e);
            alert("Ошибка при удалении. Проверьте соединение.");
          });
      },
    docDelConfirm(e, ee) {
      this.delDocName = e;
      this.delDocId = ee.replace('id','');
     // console.log('e=>', e, 'ee=>', ee);
    },
    btn_zagruzka() {
      this.seen = !this.seen;
      if (this.component == "sudozahod") {
        var btn = document.querySelector(".btn-zahod");
        if (btn) { btn.click(); }
      }
      if (this.component == "sudoothod") {
        var btn = document.querySelector(".btn-othod");
        if (btn) { btn.click(); }
      }
    },
    listView: function() {
      this.loading=1;
      axios
        .get(this.url + "?component=" + this.component + "&get_list=1")
        .then( res => {
          this.loading=0;
          this.files = eval("(" + res.data + ")"); //парсим текст в объект;
          //console.log('this.files===>>',this.files);
          if (!this.readonly) {
            //тестим - есть ли что-то в списке уже загруженных;)
            this.upBtnView = Object.keys(this.files).length > 0 ? true : false;
          } 
        })
        .then( () => {        this.uploaded_list(); this.loading=0;     })
        .catch( e => {
          console.info("catch->", e);
          //that.status = 0;
          //that.msg = "Ошибка при проверке уже загруженных документов. Проверьте соединение.";
          //that.showAlert();
          //that.alertColor = "danger"; 
          this.loading=0;
        });
    },
    uploaded_list: function uploaded_list() {
      var that = this;
      var group = 0;
      axios
       .get(that.url + "?component=" + that.component + "&action=get_uploaded_list&EntID=" + that.EntID )
        .then(function(res) {           //console.log('ОТВЕТ2',res.data);
          if ( res.data.msg != null ) {
            var uploadedDocs = res.data.msg.split(",");
            // console.log('otvet->',uploadedDocs, 'that.files=>',that.files);
            uploadedDocs.forEach(function(e) {
              // console.log('uploadedDOCS=>>>',e,that.files)
              try {
                that.files["id" + e].loaded = 1;
                that.upBtnView = true; //есть что-то в списке уже загруженных;)
              } catch (err) { if (group == 0) { //console.groupCollapsed("=>uploaded_list:");
                             }
              group = 1;
              console.info("=>File loaded ERRR => ","=>uploadedDocs:",uploadedDocs,"\n","=>e:",e,"\n","=>that.files:",that.files,"\n","=>that:",that,"\n","=>err:",err);
              } //console.log('that.files["id"+e]=>',that.files["id"+e])
            });
          }
        });
      if (group != 0) {/*console.groupEnd();*/}
    },

    uploadedHandler: function(e, ee) { // console.log('uploadedHandler=>', this, e, ee);
      this.listView(); 
    }
  },
  mounted() {this.listView();/*грузит все доки .!.*/  }
}




</script>