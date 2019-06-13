<template>
  <div>
    <div v-if="upBtnView" class="pull-center">
      <button class="btn" @click="btn_zagruzka" :class="{ 'btn-primary': seen,
                                                          'btn-danger': (!seen&&!readonly),
                                                          'btn-info': (!seen&&readonly) }">
        <i class="glyphicon glyphicon-share"></i>
        <i class="fas" :class="{ 'fa-paperclip':!seen, 'fa-times':seen}"></i>
        {{ btn_upload_text }}
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
          :isCapitan="isCapitan"
          :confirm="confirm.includes(index.replace('id',''))"
          :key2="index"
          :docs4postUpload="docs4postUpload"
          @uploaded="uploadedHandler"
          @go_modal="go_modal"
        ></p>
        <h3 v-if="loading==1">Loading...</h3>
      </div>
      </transition-group>
    </div>



    <b-alert
      :show="dismissCountDown"
      dismissible
      fade
      variant="warning"
      @dismiss-count-down="countDownChanged"
    >
    <span>{{ alertText }}</span>
       Оповещение закроется через {{ dismissCountDown }} сек...
    </b-alert>

    <b-modal
        ref="my-modal"
        :ok-title="modal_okTitle"
        cancel-title="Отмена"
        :centered="true"
        no-close-on-esc
        hide-header-close
        no-close-on-backdrop
        @cancel="cancelHandler"
        @ok="modal_OK_HANDLER"
        :title='modal_title'
      >
      <p class="pull-center"><b>{{ modal_docName }}</b></p>
      <hr>
      <h4 class="pull-center" >{{ modal_sign_btn }}</h4>
    </b-modal>
  </div>
</template>

<script>
import input from "./Input.vue";

export default {
 components: { 'app-input': input },
  props: ["component", "url", "formats", "readonly", "candelete", "EntID", "docs4postUpload", 'disabledDocIds', 'isCapitan'],
  data() {
    return {
      loading: 0,
      modal_docName:'',
      modal_docId:'',
      modal_mode:null,
      seen: false,
      files: [],
      msg: "",
      status: "",
      upBtnView: false,
      confirm:[],

      alertText: 'Ошибка соединения с сервером!',
        dismissSecs: 5,
        dismissCountDown: 0,

    };
  },
   computed: {
     modal_okTitle(){
       const m = this.modal_mode;
       return m =='del'? 'Удалить':
              m == 'sign'? 'Подтверждаю':
              m == 'unsign'?'Отменить подтверждение':
              'Ok'
     },
    btn_upload_text() {
      if (!this.seen && !this.readonly) {
        return "Загрузить документы"; //на " + this.component;
      } else if (!this.seen && this.readonly) {
        return "Показать документы"; // на " + this.component;
      } else { return "Скрыть"; }
    },
    modal_title() {
      if(this.modal_mode == 'del') return 'Вы действительно хотите удалить документ'
      if(this.modal_mode == 'sign') return 'Подтвердить документ'
      if(this.modal_mode == 'unsign') return 'Отменить подтверждение документа'
    },
    modal_sign_btn() {
      if(this.modal_mode == 'del') return 'Подтвердите удаление'
      if(this.modal_mode == 'sign') return 'Вы уверены, что хотите подтвердить?'
      if(this.modal_mode == 'unsign') return 'Вы уверены, что хотите отменить подтверждение?'
    }
  },
  methods: {
      countDownChanged(dismissCountDown) {
        this.dismissCountDown = dismissCountDown
      },
      showAlert(alertText = 'Ошибка соединения с сервером!') {
        this.alertText = alertText
        this.dismissCountDown = this.dismissSecs
      },
    go_modal(nameDOC,idDOC, modal_mode) {
      this.$refs['my-modal'].show()
      this.modal_docName = nameDOC;
      this.modal_docId = idDOC;
      this.modal_mode = modal_mode;
    },
    cancelHandler() {
      EventBus.$emit("cancelHandler", {
        title:this.modal_docName,
        key2:this.modal_docId,
      });
    },
    modal_OK_HANDLER() {
      if(this.modal_mode == 'del') this.deleteDoc();
      if(this.modal_mode == 'sign') this.confirmDoc();
      if(this.modal_mode == 'unsign') this.unConfirmDoc();
    },
    deleteDoc() {
        axios
          .get(this.url + "?component=" + this.component + "&action=delete_doc&id=" + this.modal_docId +"&EntID=" +this.EntID)
          .then(res=>{ // console.log(res);
            this.listView();
          })
          .catch( e => {
            console.log(e);
            this.showAlert('Ошибка при удалении. Проверьте соединение.');
          });
      },
      confirmDoc() {
        axios
          .get(this.url + "?component=" + this.component + "&action=confirm_doc&id=" + this.modal_docId +"&EntID=" +this.EntID)
          .then(res=> this.listView() )
          .catch( e => this.showAlert('Ошибка при подтверждении документа. Проверьте соединение.') );
      },
      unConfirmDoc() {
        axios
          .get(this.url + "?component=" + this.component + "&action=unconfirm_doc&id=" + this.modal_docId +"&EntID=" +this.EntID)
          .then(res=> this.listView() )
          .catch( e => this.showAlert('Ошибка при отмене подтверждении документа. Проверьте соединение.') );
      },
    btn_zagruzka() {
      this.seen = !this.seen;
      if (this.component == "sudozahod") {
        const btn = document.querySelector(".btn-zahod");
        if (btn) { btn.click(); }
      }
      if (this.component == "sudoothod") {
        const btn = document.querySelector(".btn-othod");
        if (btn) { btn.click(); }
      }
    },
    listView() {
      this.loading=1;
      axios
        .get(this.url + "?component=" + this.component + "&get_list=1&json=01")
        .then( res => {
          this.loading=0;
          this.files = typeof res.data == 'object' ? res.data : eval("(" + res.data + ")"); //парсим текст в объект; //+++ UPD 10.6.2019: EVAL  OLD WAY -> 4LEGACY
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
          if (e.response.status === 401) this.showAlert('Необходимо повторно авторизироваться. ')
          else this.showAlert('Ошибка при проверке уже загруженных документов. Проверьте соединение.')
        });
    },
    uploaded_list () {
      let group = 0;
      axios
       .get(this.url + "?component=" + this.component + "&action=get_uploaded_list&EntID=" + this.EntID )
        .then( res => {           //console.log('ОТВЕТ2',res.data);
          if ( res.data && res.data.msg != null ) {
            const confirm = res.data.confirm && res.data.confirm.split(',');
            if(confirm) this.confirm = confirm;

            const uploadedDocs = res.data.msg && res.data.msg.split(',');
            // console.log('otvet->',uploadedDocs, 'that.files=>',that.files);
            uploadedDocs.forEach( (e,i) => {
              try {
                this.files["id" + e].loaded = 1;
                this.upBtnView = true; //есть что-то в списке уже загруженных;)
              } catch (err) { if (
                group == 0) { //console.groupCollapsed("=>uploaded_list:");

              }
              group = 1;
              console.info("=>File loaded ERRR => ","=>uploadedDocs:",uploadedDocs,"\n","=>e:",e,"\n","=>this.files:",this.files,"\n","=>this:",this,"\n","=>err:",err);
              } //console.log('that.files["id"+e]=>',that.files["id"+e])
            });
          }
        })
      if (group != 0) {/*console.groupEnd();*/}
    },

    uploadedHandler (e, ee) { this.listView(); }
  },
  mounted() {this.listView();/*грузит все доки .!.*/  }
}




</script>
<style>
  .modal-dialog.modal-md.modal-dialog-centered {
    color: black;
  }
</style>
