//import Vue from 'vue'; 
import App from "./App.vue"; 

window.newVue = (sel, comp, read = 1, ur, frmt, EntID, del = 0, docs4postUpload = "", disabledDocIds="") => { 
  new Vue({
    el: sel,
    render: h => h(App, {
      props: {
        component: comp,
        readonly: read,
        candelete: del,
        url: ur,
        formats: frmt,
        EntID: EntID,
        docs4postUpload: docs4postUpload.split(","),
        disabledDocIds: disabledDocIds.split(',')  
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