//import Vue from 'vue';
import App from "./App.vue";

window.EventBus = new Vue();

window.newVue = (sel, component, readonly = 1, url, formats, EntID, candelete = 0, docs4postUpload="", disabledDocIds="", isCapitan = 0) => {
  new Vue({
    el: sel,
    render: h => h(App, {
      props: {
        component,
        readonly,
        candelete,
        url,
        formats,
        EntID,
        docs4postUpload: docs4postUpload.split(","),
        disabledDocIds: disabledDocIds.split(','),
        isCapitan
      }
    })
  })
}





/*
Vue.component("App_sudozahod", {
  template: `<div><app-upload  :readonly="readonly" :url="url" :formats="formats" :component="component"></app-upload>
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
