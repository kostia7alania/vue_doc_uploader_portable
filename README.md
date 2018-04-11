# vue_doc_uploader_portable
Компонент позволяет загружать и открывать загруженные документы. 
<p>Пример серверной части можно найти в папке <b>Portable -> doc_upload.php</b></p>. 

<img src="https://sun1-4.userapi.com/c840429/v840429274/7371a/CgXOasGuA6g.jpg">
<h1>USAGE:</h1>
<h4>HTML ->head</h4>
<code>
<pre>
<!-- VUE -->
<link 	href="./js/uploader/portable/css/style.css"         type="text/css" rel="stylesheet"/>
<link 	href="./js/uploader/portable/css/bootstrap.min.css" type="text/css" rel="stylesheet"/>
<link 	href="./js/uploader/portable/css/bootstrap-vue.css" type="text/css" rel="stylesheet"/>
<script src='./js/uploader/portable/libs/vue.js'            type="text/javascript"></script>
<script	src="./js/uploader/portable/libs/bootstrap-vue.js"  type="text/javascript"></script>
<script src="./js/uploader/portable/libs/axios.min.js"      type="text/javascript"></script>

<script src="./js/uploader/portable/script.js"              type="text/javascript" ></script>
<script src="./js/uploader/portable/libs/polyfill.min.js"   type="text/javascript"></script>

<link href="https://use.fontawesome.com/releases/v5.0.9/css/all.css"  rel="stylesheet" >
<!-- /VUE -->
</pre>
</code>
<h2>Call from PHP:</h2>
<code>
if ($row['Actual']==1) 
$doc =  '<div align="center" id="app_1"></div><script>selector = "#app_1"; component = "sudos"; readonly = 0; formats = ".pdf";url123 = "//192.168.202.103/seaport***_new/doc_upload.php"; newVue(selector, component, readonly, url123, formats,'.$ID.');</script>';
else $doc =  '<div align="center" id="app_1"></div><script>selector = "#app_1"; component = "sudos"; readonly = 1; formats = ".pdf";url123 = "//192.168.202.103/seaport***_new/doc_upload.php"; newVue(selector, component, readonly, url123, formats,'.$ID.');</script>';
</code>

<h2>Basic usage</h2>
<code>
<pre>
//  > USAGE 4demo => 	<code> <div align="center" id="app_1"></div> </code>
/*let
       selector = "#app_1",
       component = "sudozahod",
       readonly = 0,
       url = "//192.168.202.103/seaport_new/doc_upload.php",
       formats = ".pdf",
       EntID = 123456;
       newVue(selector, component, readonly, url, formats, EntID);
       newVue("#app_2", "sudozahod", 1, url, formats, EntID);
 */
 
</pre>
</code>
