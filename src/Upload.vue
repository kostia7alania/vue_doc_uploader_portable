<template>
  <span>
    <!--<input ref="fileInput" @change="flsChange" :accept="formats" type="file" />-->


    <!--
    <label class="file">
      <input  ref="fileInput" @change="flsChange" :accept="formats" type="file" id="file" aria-label="File browser">
      <span class="file-custom"></span>
    </label>
    -->

    <b-form-file @change="flsChange" :file-name-formatter="formatNames" required :accept="formats"></b-form-file>

    <button :disabled="uplBtnStat" class="btn btn-danger hover_effects" @click="uplHandler">Загрузить</button>
  </span>
</template>

<script>
export default {
  props: ['formats', 'url', 'component', 'id', 'EntID'],
  //props: ["title","","files","id","loaded","url","component",,"candelete","EntID","key2","", "isCapitan", ''],
  data() {
    return {
      file: undefined,
      uplBtnStat: true,
    }
  },
  methods: {

      formatNames(files) {
        if (files.length === 1) {
          return files[0].name
        } else {
          return `${files.length} files selected`
        }
      },

    flsChange (e) {
      this.file = e.target.files[0] || undefined
      this.uplBtnStat = this.file == undefined
      window.t = this;
    },
    uplHandler(e) {
      this.uplBtnStat = true; //  console.log(1,this,2,e)
      const head = {
        headers: { Accept: "application/json", "Content-Type": "application/octet-stream" },
        onUploadProgress: e => {
          if (e.loaded > 0 && e.total > 0)
            this.$emit('uploadPercentage', parseInt( Math.round(e.loaded * 100 / e.total) ) )
          else this.$emit('uploadPercentage', 0)
        }
      };

      const fd = new FormData();
      fd.append("file", this.file, this.file.name);
      fd.append("id", this.id);
      fd.append("EntID", this.EntID);
      axios
        .post(
          this.url + "?component=" + this.component + "&action=post",
          fd,
          head
        )
        .then( res => {
          this.$emit('showAlertEmit', {msg: res.data.msg, status: res.data.status})
          this.$emit("uploaded");
        })
        .catch( e => {
          this.$emit('showAlertEmit', {msg:'Ошибка при передаче файла. Проверьте соединение.', status: 0})
          console.info("catch->", e);
          setTimeout( () => {
            this.$emit('uploadPercentage', 0)
            this.uplBtnStat = false;
          }, 1000);
        });
    },
  }
}
</script>
