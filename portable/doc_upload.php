<? 
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
 /*
echo '<br>post:<br>'; var_dump($_POST);
echo '<br>get:<br>';  var_dump($_GET);
echo '<br>file:<br>';  var_dump($_FILES); 
 */
$user     = 'sa'; 
$pass     = '013se*';  //$server   = '192.***.***.106';
$server   = '***.***.***.103'; //$server   = 'localhost';
$database = 'seaport_new';
$connectionInfo=array("UID"=>$user,"PWD"=>$pass,"Database"=>$database);
///PDO
try {$link = new PDO ("sqlsrv:Server=$server;Database=$database","$user","$pass");}
catch (PDOException $e) { echo "Failed to get DB handle: " . $e->getMessage() . "\n"; exit;}
$msg;$status;

if($_GET['component']=='sudozahod'){

    if($_GET['get_list']==1){

            $sql = "SELECT t2.* , t1.Number
		   FROM [dbo].[DictionaryDocumentsSeaport] t1 INNER JOIN [dbo].[DictionaryDocuments] t2 ON t1.IDDictionaryDocuments = t2.ID
		   WHERE t1.ID = 0";

        try{  

        $stmt = $link->prepare($sql);
	 $stmt->execute(); 
        $a = '{';
	while($row = $stmt->fetch()){
        $a .= "id".$row['ID'].":{title:'".$row['Number'].'. '.$row['Name']."',loaded:0},";

  };                                                          	     
	mb_substr($a, 0, -1);
	$a.= '}';
        }catch(PDOException $e){$status=0;$msg = 'Ошибка с SQL!';} //.$e;

        echo json_encode($a);
        die();
    }

    if($_GET['action']=='get_uploaded_list'){
        if( (strlen($_GET['EntID'])>0) && (strlen($_GET['EntID'])<10)  ){
        $EntID = $_GET['EntID']; 
            $sql = "SELECT t1.[UID]
                ,t1.[Documents] ,t1.[IDDocuments] ,t1.[HDateOfSubmit] 
                FROM Documents as t1  
                JOIN DocumentsEnteringStatus as t2 ON t1.UID = t2.UIDDocuments
                JOIN EnteringStatus t3 ON t3.ID = t2.IDEnteringStatus
                WHERE t3.Status != -1 AND t3.EntID = $EntID ";
                if(isset($_GET['doc_id'])) {
                    if( (strlen($_GET['doc_id'])>0) && (strlen($_GET['doc_id'])<3)  ){
                        $doc_id = $_GET['doc_id']; 
                        $sql .= " AND t1.IDDocuments = $doc_id";
                        
                        $stmt = $link->prepare($sql);
                        try{$stmt->execute(); 
                            while($row = $stmt->fetch()){
                            $msg = $row['Documents']; $status=1;
                            echo header('Content-Type: application/pdf');
                            $msg = str_replace('data:application/pdf;base64,','',$msg);
                            echo (base64_decode($msg));
                            die;
                        }; 
                        }catch(PDOException $e){$status=0;$msg = 'Ошибка с SQL!';} //.$e;
                    } else { $msg = 'Не верный doc_id; '; $status = 0; }
                }
    
        $stmt = $link->prepare($sql);
        try{    $stmt->execute(); 
        while($row = $stmt->fetch()){
        $msg .= strlen($msg)>0?',':''; //if(strlen($msg)>0){$msg .= ',';}
        $msg .= $row['IDDocuments']; //'Data is Successifully Fetched from msSQL-db';
        $status=1;
        }; 
        }catch(PDOException $e){$status=0;$msg = 'Ошибка с SQL!';} //.$e;
    
    } else { $status=0; $msg='Не верный EntID ';}
    }

    elseif($_GET['action']=='post'){

        if( (strlen($_POST['id'])>0) && (strlen($_POST['id'])<3)  ){
            $id = $_POST['id']; 
        } else { 
            $msg = 'Не верный id; '; $status = 0;
        }

        if( (strlen($_POST['EntID'])>0) && (strlen($_POST['EntID'])<10)  ){
            $EntID = $_POST['EntID']; 
        } else { 
            $msg = 'Не верный EntID; '; $status = 0;
        }
        if( isset($_FILES['file']) ){
            $file = $_FILES['file']['tmp_name'];
            $type = $_FILES['file']['type'];
        } else {$msg = 'Не верный файл; '; $status = 0;}
        if($type != "application/pdf"){    $msg .= 'Не верный формат файла! ';}
        if(!strlen($msg)>0){
            $data = file_get_contents($file);
            $base64 = 'data:' . $type . ';base64,' . base64_encode($data);//echo $base64; 
            // sql >> 
            $sql = "
            DECLARE @UIDDocuments UNIQUEIDENTIFIER  = NEWID()

            INSERT INTO [dbo].[Documents] 
            ( [UID],[IDDocuments],[Documents],[HDateOfSubmit])
            VALUES (@UIDDocuments,'".$id."','".$base64."',GETDATE())
            
            DECLARE @ID INT = (SELECT TOP (1) ID
            FROM [dbo].[EnteringStatus]
            WHERE EntID =".$EntID." AND [Status] != '-1' )

            DECLARE @UID UNIQUEIDENTIFIER = (SELECT t1.UID FROM [dbo].[Documents] t1 INNER JOIN [dbo].[DocumentsEnteringStatus] t2 ON t1.UID = t2.UIDDocuments AND IDDocuments = '".$id."' 
                                            INNER JOIN [dbo].[EnteringStatus] t3 ON t2.IDEnteringStatus = t3.ID
                            WHERE EntID =".$EntID." AND [Status] != '-1' ) 
            
            DELETE [dbo].[DocumentsEnteringStatus]
            WHERE IDEnteringStatus IN
            (SELECT ID
            FROM [dbo].[EnteringStatus]
            WHERE EntID = ".$EntID." AND Status != '-1' ) AND UIDDocuments  = @UID AND [IDDictionaryDocumentsSeaport] = 0
            
            INSERT INTO [dbo].[DocumentsEnteringStatus]
            VALUES (@UIDDocuments,@ID,0,NULL)";
        

            $stmt = $link->prepare($sql);
            try{    $stmt->execute();
                    $row = $stmt->fetch(); 
                    $msg = 'Успешно отправлено!';
            }catch(PDOException $e){$msg = 'Ошибка с SQL!';} //.$e;
        
            unlink($file);
            $status = 1;
        }
    } else { $status=0; $msg = 'Не верное действие';}
}else 


if($_GET['component']=='sudoothod'){
    if($_GET[get_list]==1){
            $sql = "SELECT t2.* , t1.Number
		   FROM [dbo].[DictionaryDocumentsSeaport] t1 INNER JOIN [dbo].[DictionaryDocuments] t2 ON t1.IDDictionaryDocuments = t2.ID
		   WHERE t1.ID = 1";

        try{  

        $stmt = $link->prepare($sql);
	 $stmt->execute(); 
        $a = '{';
	while($row = $stmt->fetch()){
	
	     $a .= "id".$row['ID'].":{title:'".$row['Number'].'. '.$row['Name']."',loaded:0},";
        }; 
	mb_substr($a, 0, -1);
	$a.= '}';
        }catch(PDOException $e){$status=0;$msg = 'Ошибка с SQL!';} //.$e;

        echo json_encode($a);
        die();
    }

    if($_GET['action']=='get_uploaded_list'){
        if( (strlen($_GET['EntID'])>0) && (strlen($_GET['EntID'])<10)  ){
        $EntID = $_GET['EntID']; 
            $sql = "SELECT t1.[UID]
                ,t1.[Documents] ,t1.[IDDocuments] ,t1.[HDateOfSubmit] 
                FROM Documents as t1  
                JOIN DocumentsEnteringStatus as t2 ON t1.UID = t2.UIDDocuments
                JOIN EnteringStatus t3 ON t3.ID = t2.IDEnteringStatus
                WHERE t3.Status = '-1' AND t3.EntID = $EntID ";
                if(isset($_GET['doc_id'])) {
                    if( (strlen($_GET['doc_id'])>0) && (strlen($_GET['doc_id'])<3)  ){
                        $doc_id = $_GET['doc_id']; 
                        $sql .= " AND t1.IDDocuments = $doc_id";
                        
                        $stmt = $link->prepare($sql);
                        try{$stmt->execute(); 
                            while($row = $stmt->fetch()){
                            $msg = $row['Documents']; $status=1;
                            echo header('Content-Type: application/pdf');
                            $msg = str_replace('data:application/pdf;base64,','',$msg);
                            echo (base64_decode($msg));
                            die;
                        }; 
                        }catch(PDOException $e){$status=0;$msg = 'Ошибка с SQL!';} //.$e;
                    } else { $msg = 'Не верный doc_id; '; $status = 0; }
                }
    
        $stmt = $link->prepare($sql);
        try{    $stmt->execute(); 
        while($row = $stmt->fetch()){
        $msg .= strlen($msg)>0?',':''; //if(strlen($msg)>0){$msg .= ',';}
        $msg .= $row['IDDocuments']; //'Data is Successifully Fetched from msSQL-db';
        $status=1;
        }; 
        }catch(PDOException $e){$status=0;$msg = 'Ошибка с SQL!';} //.$e;
    
    } else { $status=0; $msg='Не верный EntID ';}
    }

    elseif($_GET['action']=='post'){

        if( (strlen($_POST['id'])>0) && (strlen($_POST['id'])<3)  ){
            $id = $_POST['id']; 
        } else { 
            $msg = 'Не верный id; '; $status = 0;
        }

        if( (strlen($_POST['EntID'])>0) && (strlen($_POST['EntID'])<10)  ){
            $EntID = $_POST['EntID']; 
        } else { 
            $msg = 'Не верный EntID; '; $status = 0;
        }
        if( isset($_FILES['file']) ){
            $file = $_FILES['file']['tmp_name'];
            $type = $_FILES['file']['type'];
        } else {$msg = 'Не верный файл; '; $status = 0;}
        if($type != "application/pdf"){    $msg .= 'Не верный формат файла! ';}
        if(!strlen($msg)>0){
            $data = file_get_contents($file);
            $base64 = 'data:' . $type . ';base64,' . base64_encode($data);//echo $base64; 
            // sql >> 
            $sql = "
            DECLARE @UIDDocuments UNIQUEIDENTIFIER  = NEWID()

            INSERT INTO [dbo].[Documents] 
            ( [UID],[IDDocuments],[Documents],[HDateOfSubmit])
            VALUES (@UIDDocuments,'".$id."','".$base64."',GETDATE())
            
            DECLARE @ID INT = (SELECT TOP (1) ID
            FROM [dbo].[EnteringStatus]
            WHERE EntID =".$EntID." AND [Status] = '-1' )

            DECLARE @UID UNIQUEIDENTIFIER = (SELECT t1.UID FROM [dbo].[Documents] t1 INNER JOIN [dbo].[DocumentsEnteringStatus] t2 ON t1.UID = t2.UIDDocuments AND IDDocuments = '".$id."' 
                                            INNER JOIN [dbo].[EnteringStatus] t3 ON t2.IDEnteringStatus = t3.ID
                            WHERE EntID =".$EntID." AND [Status] = '-1' ) 
         
            DELETE [dbo].[DocumentsEnteringStatus]
            WHERE IDEnteringStatus IN
            (SELECT ID
            FROM [dbo].[EnteringStatus]
            WHERE EntID = ".$EntID." AND Status = '-1' ) AND UIDDocuments  = @UID  AND [IDDictionaryDocumentsSeaport] = 1
            
            INSERT INTO [dbo].[DocumentsEnteringStatus]
            VALUES (@UIDDocuments,@ID,1,NULL)";


            $stmt = $link->prepare($sql);
            try{    $stmt->execute();
                    $row = $stmt->fetch(); 
                    $msg = 'Успешно отправлено!';
            }catch(PDOException $e){$msg = 'Ошибка с SQL!';} //.$e;
        
            unlink($file);
            $status = 1;
        }
    } else { $status=0; $msg = 'Не верное действие';}
}




if($_GET['component']=='sudos'){ 
    
    if($_GET[get_list]==1){
            $sql = "SELECT t2.* , t1.Number
		   FROM [dbo].[DictionaryDocumentsSeaport] t1 INNER JOIN [dbo].[DictionaryDocuments] t2 ON t1.IDDictionaryDocuments = t2.ID
		   WHERE t1.ID = 2";

        try{  

        $stmt = $link->prepare($sql);
	 $stmt->execute(); 
        $a = '{';
	while($row = $stmt->fetch()){
	
	     $a .= "id".$row['ID'].":{title:'".$row['Number'].'. '.$row['Name']."',loaded:0},";
        }; 
	mb_substr($a, 0, -1);
	$a.= '}';
        }catch(PDOException $e){$status=0;$msg = 'Ошибка с SQL!';} //.$e;

        echo json_encode($a);
        die();
    }

    if($_GET['action']=='get_uploaded_list'){
        if( (strlen($_GET['EntID'])>0) && (strlen($_GET['EntID'])<10)  ){
        $EntID = $_GET['EntID']; 
            $sql = "
                SELECT t1.[UID]
                ,t1.[Documents] ,t1.[IDDocuments] ,t1.[HDateOfSubmit] 
                FROM Documents as t1  
                JOIN DocumentsEnteringStatus as t2 ON t1.UID = t2.UIDDocuments
                JOIN WaterArea t3 ON t3.ID = t2.IDWaterArea
                WHERE t3.ID = $EntID  ";
                if(isset($_GET['doc_id'])) {
                    if( (strlen($_GET['doc_id'])>0) && (strlen($_GET['doc_id'])<3)  ){
                        $doc_id = $_GET['doc_id']; 
                        $sql .= " AND t1.IDDocuments = $doc_id";
                        
                        $stmt = $link->prepare($sql);
                        try{$stmt->execute(); 
                            while($row = $stmt->fetch()){
                            $msg = $row['Documents']; $status=1;
                            echo header('Content-Type: application/pdf');
                            $msg = str_replace('data:application/pdf;base64,','',$msg);
                            echo (base64_decode($msg));
                            die;
                        }; 
                        }catch(PDOException $e){$status=0;$msg = 'Ошибка с SQL!';} //.$e;
                    } else { $msg = 'Не верный doc_id; '; $status = 0; }
                }
    
        $stmt = $link->prepare($sql);
        try{    $stmt->execute(); 
        while($row = $stmt->fetch()){
        $msg .= strlen($msg)>0?',':''; //if(strlen($msg)>0){$msg .= ',';}
        $msg .= $row['IDDocuments']; //'Data is Successifully Fetched from msSQL-db';
        $status=1;
        }; 
        }catch(PDOException $e){$status=0;$msg = 'Ошибка с SQL!';} //.$e;
    
    } else { $status=0; $msg='Не верный EntID ';}
    }

    elseif($_GET['action']=='post'){

        if( (strlen($_POST['id'])>0) && (strlen($_POST['id'])<3)  ){
            $id = $_POST['id']; 
        } else { 
            $msg = 'Не верный id; '; $status = 0;
        }

        if( (strlen($_POST['EntID'])>0) && (strlen($_POST['EntID'])<10)  ){
            $EntID = $_POST['EntID']; 
        } else { 
            $msg = 'Не верный EntID; '; $status = 0;
        }
        if( isset($_FILES['file']) ){
            $file = $_FILES['file']['tmp_name'];
            $type = $_FILES['file']['type'];
        } else {$msg = 'Не верный файл; '; $status = 0;}
        if($type != "application/pdf"){    $msg .= 'Не верный формат файла! ';}
        if(!strlen($msg)>0){
            $data = file_get_contents($file);
            $base64 = 'data:' . $type . ';base64,' . base64_encode($data);//echo $base64; 
            // sql >> 
            $sql = "
            DECLARE @UIDDocuments UNIQUEIDENTIFIER  = NEWID()

            INSERT INTO [dbo].[Documents] 
            ( [UID],[IDDocuments],[Documents],[HDateOfSubmit])
            VALUES (@UIDDocuments,'".$id."','".$base64."',GETDATE())
            
            DECLARE @ID INT = (SELECT TOP (1) ID
            FROM [dbo].[WaterArea]
            WHERE ID =".$EntID." )

            DECLARE @UID UNIQUEIDENTIFIER = (SELECT t1.UID FROM [dbo].[Documents] t1 INNER JOIN [dbo].[DocumentsEnteringStatus] t2 ON t1.UID = t2.UIDDocuments AND IDDocuments = '".$id."' 
                                            INNER JOIN [dbo].[WaterArea] t3 ON t2.IDEnteringStatus = t3.ID
                            WHERE ID =".$EntID." ) 
         
            DELETE [dbo].[DocumentsEnteringStatus]
            WHERE IDEnteringStatus IN
            (SELECT ID
            FROM [dbo].[WaterArea]
            WHERE ID = ".$EntID.") AND UIDDocuments  = @UID   AND [IDDictionaryDocumentsSeaport] = 2
            
            INSERT INTO [dbo].[DocumentsEnteringStatus]
            VALUES (@UIDDocuments,NULL,2,@ID)";



            $stmt = $link->prepare($sql);
            try{    $stmt->execute();
                    $row = $stmt->fetch(); 
                    $msg = 'Успешно отправлено!';
            }catch(PDOException $e){$msg = 'Ошибка с SQL!';} //.$e;
        
            unlink($file);
            $status = 1;
        }
    } else { $status=0; $msg = 'Не верное действие';}
}


$arr = array('status' => $status, 'msg' => $msg);// echo json_encode($arr);
echo json_encode($arr);
die();
?>