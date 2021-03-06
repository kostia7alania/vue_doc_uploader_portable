# vue_doc_uploader_portable
Компонент позволяет загружать и открывать загруженные документы и удалять=). 
<p>Пример серверной части можно найти в папке <b>Portable -> doc_upload.php</b></p>. 

<img src="https://m.vk.com/doc-125614288_465782482">
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
$doc =  '<div id="app_1"></div><script>var selector = "#app_1", component = "sudos", readonly = 0, formats = ".pdf", url123 = "//192.168.202.103/seaport***_new/doc_upload.php", canDelete = 1, docs4postUpload = "id44"; newVue(selector, component, readonly, url123, formats,'.$ID.', canDelete, docs4postUpload); </script>';




else $doc =  '<div id="app_1"></div> <script>var selector = "#app_1", component = "sudos", readonly = 1, formats = ".pdf", url123 = "//192.168.202.103/seaport***_new/doc_upload.php", canDelete = 1, docs4postUpload = "id44"; newVue(selector, component, readonly, url123, formats,'.$ID.', canDelete, docs4postUpload);</script>';
</code>

<h2>Basic usage</h2>
<code>
<pre>
//  > USAGE 4demo => 	 
 <div align="center" id="app_1" ></div>

let
       selector = "#app_1",
       component = "sudozahod",
       readonly = 0, 
       url = "//192.168.202.103/seaport_new/doc_upload.php",
       formats = ".pdf,docx,doc",
       EntID = 123456,
       canDelete = 1,
       docs4postUpload = "id1"; //дает право загружать доки с этим ID даже если стоит отметка - readonly, при этом, если документ уже загружен, то его нельзя перезалить или удалить.
       newVue(selector, component, readonly, url, formats, EntID, canDelete, docs4postUpload); 
</pre>
</code> 

<p>old screens:</p>
<img src="https://pp.userapi.com/c834102/v834102776/11174e/oZxAjIAhtB8.jpg">
<img src="https://pp.userapi.com/c845322/v845322120/36ed9/UVptQSyjThM.jpg">

<hr>
<img src="https://sun1-4.userapi.com/c840429/v840429274/7371a/CgXOasGuA6g.jpg">
<img src="https://m.vk.com/doc40778210_463992267">
