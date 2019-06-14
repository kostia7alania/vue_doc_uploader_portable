<template>
<div>
    <div class="docBlock" v-if="!readonly ||
      (readonly && (loaded || docs4postUpload.includes(key2)) )
      " >
    <span>{{title}} <span style="color:red"></span> </span>
       <div class="form-group pull-center">

        <upload v-if="(!readonly || (docs4postUpload.includes(key2) && !loaded)) && !checked_local"
          :formats="formats"
          :url="url"
          :component="component"
          :id="id"
          :EntID="EntID"
          @uploadPercentage="uploadPercentage = $event"
          @showAlertEmit="showAlertEmit"
          @uploaded="$emit('uploaded')"
        />

        <template v-if="loaded">

          <a class="btn btn-success hover_effects" target="_blank" :href="url+'?component='+component+'&action=get_uploaded_list&EntID='+EntID+'&doc_id='+id">
            Открыть загруженный документ
          </a>

          <b-btn v-if="candelete && !checked_local" class="btn btn-info hover_effects" @click="go_modal('del')">Удалить</b-btn>

          <b-form-checkbox v-if="isCapitan" @change="toggleAll" class="enabled_check hover_effects"
            v-model="checked_local" >{{ switches_text }}
          </b-form-checkbox>
          <b-form-checkbox v-if="!isCapitan && checked_local" class="disabled_check"
            :checked="checked_local" disabled>подтверждено
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
                  <b-badge variant="success">{{ status }}==1?'':'Error! '}} {{msg}} </b-badge>
                  <br>
              <b-badge variant="Light" style="font-size:14px;color:black">Это оповещение будет скрыто автоматически через {{dismissCountDown}} сек...</b-badge>
            </h3>
          </b-alert>
        </transition>

      </div>

	  </div>
</template>

<script>
import UploadVue from './Upload.vue';
export default {
  props: ["title","formats","files","id","loaded","url","component","readonly","candelete","EntID","key2","docs4postUpload", "isCapitan", 'confirm'],
  components: {"upload":UploadVue},
  data() {
    return {
      max: 100,
      uploadPercentage: 0,
      status: "",
      msg: "",
      dismissSecs: 10,
      dismissCountDown: false,
      alertColor: "warning",
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
    showAlertEmit(e) {
      this.msg = e.msg
      this.status = e.status
      this.showAlert()
    },
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
    countDownChanged(dismissCountDown) { this.dismissCountDown = dismissCountDown; },
    showAlert() { this.dismissCountDown = this.dismissSecs; }
  }
}
</script>
