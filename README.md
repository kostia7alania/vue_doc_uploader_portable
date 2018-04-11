# vue_doc_uploader_portable


<img src="https://sun1-4.userapi.com/c840429/v840429274/7371a/CgXOasGuA6g.jpg">
USAGE:

<!-- VUE -->
<link 	href="./js/uploader/portable/css/style.css" 						type="text/css" rel="stylesheet"/>
<link 	href="./js/uploader/portable/css/bootstrap.min.css" 		type="text/css" rel="stylesheet"/>
<link 	href="./js/uploader/portable/css/bootstrap-vue.css" 		type="text/css" rel="stylesheet"/>
<script src='./js/uploader/portable/libs/vue.js' 							type="text/javascript"></script>
<script	src="./js/uploader/portable/libs/bootstrap-vue.js"			type="text/javascript"></script>
<script src="./js/uploader/portable/libs/axios.min.js"					type="text/javascript"></script>

<script src="./js/uploader/portable/script.js"					type="text/javascript" ></script>
<script src="./js/uploader/portable/libs/polyfill.min.js"		type="text/javascript"></script>

<link href="https://use.fontawesome.com/releases/v5.0.9/css/all.css"  rel="stylesheet" >
<!-- /VUE -->

<code>
if ($row['Actual']==1) 
$doc =  '<div align="center" id="app_1"></div><script>selector = "#app_1"; component = "sudos"; readonly = 0; formats = ".pdf";url123 = "//192.168.202.103/seaport_new/doc_upload.php"; newVue(selector, component, readonly, url123, formats,'.$ID.');</script>';
else $doc =  '<div align="center" id="app_1"></div><script>selector = "#app_1"; component = "sudos"; readonly = 1; formats = ".pdf";url123 = "//192.168.202.103/seaport_new/doc_upload.php"; newVue(selector, component, readonly, url123, formats,'.$ID.');</script>';
</code>
