<template>
  <div>

    <div v-if="isFilesIsset" class="pull-center">
      <button class="btn" @click="btn_zagruzka" :class="{ 'btn-primary': isShown,
                                                          'btn-danger': (!isShown&&!readonly),
                                                          'btn-info': (!isShown&&readonly) }"
        >
        <i class="glyphicon glyphicon-share"></i>
        <i class="fas" :class="{ 'fa-paperclip':!isShown, 'fa-times':isShown}"></i>
        {{ btn_upload_text }}
      </button>

      <div v-if="!loading && isShown"> 
          <inputvue v-for="(file, index) in files"
            :key="file.title" 
            v-show="!(disabledDocIds.includes(index))"
            :url="url"
            :component="component"
            :readonly="readonly"
            :candelete="candelete"
            :EntID="EntID"
            :title="file.title"
            :id="file.id"
            :loaded="file.loaded"
            :formats="formats"
            :isCapitan="isCapitan"
            :confirm="confirm.includes(file.id)"
            :reloaded="reloaded.includes(file.id)"
            :key2="'id'+file.id"
            :docs4postUpload="docs4postUpload"
            :iconsPath="iconsPath"
            @uploaded="uploadedHandler"
            @go_modal="go_modal"
          />
         
      </div>
    </div>
    
    <loading  v-if="loading && isShown" :iconsPath='iconsPath' />

    <b-alert :show="!!alertText" dismissible fade variant="warning" >  {{ alertText }}  </b-alert>
    <b-modal
        ref="my-modal"
        @ok="modal_OK_HANDLER" @cancel="cancelHandler"
        :ok-title="modal_okTitle" cancel-title="Отмена"
        :title='modal_title'
        :centered="true" no-close-on-esc hide-header-close no-close-on-backdrop
      >
      <p class="pull-center"><b>{{ modal_docName }}</b></p>
      <hr>
      <h4 class="pull-center" >{{ modal_sign_btn }}</h4>
    </b-modal>

  </div>
</template>

<script>
import inputvue from "./Input.vue";
import LoadingVue from "./Loading.vue";

export default {
  components: { inputvue, loading: LoadingVue },
  props: [
    "component",
    "url",
    "formats",
    "readonly",
    "candelete",
    "EntID",
    "docs4postUpload",
    "disabledDocIds",
    "isCapitan",
    "iconsPath"
  ],
  data() {
    return {
      loading: false,
      isShown: false,
      modal_docName: "",
      modal_docId: "",
      modal_mode: null,
      files: [],
      msg: "",
      status: "",
      alertText: "", 
      reloaded: [],
      confirm: [], 
    };
  }, 
  computed: {
    isFilesIsset() { //тестим - есть ли что-то в списке уже загруженных;)
     return 1; //всегда отображать
    // return !this.readonly || this.files.filter(e => e.loaded == 1).length
    },
    modal_okTitle() {
      const m = this.modal_mode;
      return m == "del"
        ? "Удалить"
        : m == "sign"
        ? "Подтверждаю"
        : m == "unsign"
        ? "Отменить подтверждение"
        : "Ok";
    },
    btn_upload_text() {
      if (!this.isShown && !this.readonly) {
        return "Загрузить документы"; //на " + this.component;
      } else if (!this.isShown && this.readonly) {
        return "Показать документы"; // на " + this.component;
      } else {
        return "Скрыть";
      }
    },
    modal_title() {
      if (this.modal_mode == "del")
        return "Вы действительно хотите удалить документ";
      if (this.modal_mode == "sign") return "Подтвердить документ";
      if (this.modal_mode == "unsign")
        return "Отменить подтверждение документа";
    },
    modal_sign_btn() {
      if (this.modal_mode == "del") return "Подтвердите удаление";
      if (this.modal_mode == "sign")
        return "Вы уверены, что хотите подтвердить?";
      if (this.modal_mode == "unsign")
        return "Вы уверены, что хотите отменить подтверждение?";
    }
  },
  methods: {
    showAlert(alertText = "Ошибка соединения с сервером!") {
      this.alertText = alertText; 
    },
    go_modal(nameDOC, idDOC, modal_mode) {
      this.modal_docName = nameDOC;
      this.modal_docId = idDOC;
      this.modal_mode = modal_mode;
      if (modal_mode == "sign") return this.confirmDoc(); // =>подтверждение без подтверждения);
      this.$refs["my-modal"].show();
    },
    cancelHandler() {
      EventBus.$emit("cancelHandler", {
        title: this.modal_docName,
        key2: this.modal_docId
      });
    },
    modal_OK_HANDLER() {
      if (this.modal_mode == "del") this.deleteDoc();
      if (this.modal_mode == "sign") this.confirmDoc(); // не юзается ща
      if (this.modal_mode == "unsign") this.unConfirmDoc();
    },
    deleteDoc() {
      axios
        .get(`${this.url}?component=${this.component}&action=delete_doc&id=${this.modal_docId}&EntID=${this.EntID}`)
        .then(res => this.listView() )
        .catch(err =>  this.showAlert(`Ошибка при удалении. Сообщение: ${err.message}`))
    },
    confirmDoc() {
      axios
        .get(`${this.url}?component=${this.component}&action=confirm_doc&id=${this.modal_docId}&EntID=${this.EntID}`)
        .then(res => this.listView())
        .catch(e => {
          this.showAlert( "Ошибка при подтверждении документа. Проверьте соединение." );
          this.cancelHandler();
        });
    },
    unConfirmDoc() {
      axios
        .get(`${this.url}?component=${this.component}&action=unconfirm_doc&id=${this.modal_docId}&EntID=${this.EntID}`)
        .then(res => this.listView())
        .catch(e => {
          this.showAlert( "Ошибка при отмене подтверждении документа. Проверьте соединение." );
          this.cancelHandler();
        });
    },
    btn_zagruzka() {
      this.isShown = !this.isShown;
      if(this.isShown) this.listView();
      if (this.component == "sudozahod") {
        const btn = document.querySelector(".btn-zahod");
        if (btn) btn.click();
      }
      if (this.component == "sudoothod") {
        const btn = document.querySelector(".btn-othod");
        if (btn) btn.click();
      }
    },
    listView() {
      this.loading = true;
      axios
        .get(`${this.url}?component=${this.component}&get_list=1&json_test`)
        .then( res => {
          this.files = res.data
          // this.files = typeof res.data == "object" ? res.data : eval("(" + res.data + ")") || [])
         } ) //парсим текст в объект; //+++ UPD 10.6.2019: EVAL  OLD WAY -> 4LEGACY
        .then(() => this.get_uploaded_list())
        .catch(e => {
          console.info("catch->", e); 
          if (e.response.status === 401)
            this.showAlert("Необходимо повторно авторизироваться. ");
          else
            this.showAlert( "Ошибка при проверке уже загруженных документов. Проверьте соединение." );
        })
        .finally(() => this.loading = false);
    },
    get_uploaded_list() { 
      const cb = data => { 
            const confirmPosition = data.confirm.split(",") 
            const reloadPosition =  data.reloaded.split(",")
            this.confirm = [];  
            this.reloaded = [];
            const uploadedDocs = data.msg.split(",");
            const files = this.files
            uploadedDocs.forEach( (e, i) => {
              if(confirmPosition[i] == 1) this.confirm.push(e)
              if(reloadPosition[i] == 1) this.reloaded.push(e)
              try {
                  files.filter(obj => obj.id == e)[0].loaded = 1
               } catch(e) { }// try {  this.files["id" + e].loaded = 1; } catch (err) { // this.showAlert("Ошибка при парсинге ответа сервера. Подробности: " + err.message) 
            });
          }
    const uploaded = localStorage.getItem('uploaded_docs')
    if(uploaded) return cb(JSON.parse(uploaded))
    axios
      .get(`${this.url}?component=${this.component}&action=get_uploaded_list&EntID=${this.EntID}`)
      .then(({data}) => {
        localStorage.setItem('uploaded_docs', JSON.stringify(data))
        cb(data)
      })
      .catch(err => this.showAlert("Ошибка. Проверьте соединение. Подробности: " + err.message) );
    },

    uploadedHandler(e, ee) {
      this.listView();
    }
  },
  mounted() {
    //this.listView(); /*грузит все доки при открытии .!.*/
  }
};
</script>
