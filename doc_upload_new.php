<?
$user     = 'sa';
$pass     = '**********';  //$server   = '192.168.202.103';
$server   = '***.***.***.103'; //$server   = 'localhost';
$database = 'seaport_new';
$connectionInfo = ["UID" => $user, "PWD" => $pass, "Database" => $database];
/*заголовки для браузера*/
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: token, Origin, Content-Type, X-Auth-Token');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header('Access-Control-Max-Age: 1728000');
  header('Content-Length: 0');
  die();
  // header("Content-Type: application/json");//для заметки;-)
}
///PDO
try { $link = new PDO("sqlsrv:Server=$server;Database=$database", "$user", "$pass"); } catch (PDOException $e) {  echo "Failed to get DB handle: " . $e->getMessage() . "\n";  exit;}

/* => TESTs: */
if(!isset( $_GET['action'])) { output_json_and_die(0, 'Не указан action'); }
if(!isset( $_GET['component'])) { output_json_and_die(0, 'Не указан component'); }


if($_GET['action'] == 'delete_doc' ) delete_doc_exec($link); //удаление у всех одинаковое!
if($_GET['action'] == 'sign_doc' ) sign_doc_exec($link); //удаление у всех одинаковое!
if($_GET['action'] == 'unsign_doc' ) unsign_doc_exec($link); //удаление у всех одинаковое!

/** ***********************
 [1] sudozahod [судозаход]
 ***************************/

if ($_GET['component'] == 'sudozahod') {

  if ($_GET['get_list'] == 1) {
    $sql = get_list_sql_create(0);
    get_list_sql_exec($sql, $link);
  }


  if ($_GET['action'] == 'get_uploaded_list') {
    if ((strlen($_GET['EntID']) > 0) && (strlen($_GET['EntID']) < 10)) {
      $EntID = $_GET['EntID'];
      $sql = "SELECT t1.[UID]
                ,t1.[Documents] ,t1.[IDDocuments] ,t1.[HDateOfSubmit]
                FROM Documents as t1
                JOIN DocumentsEnteringStatus as t2 ON t1.UID = t2.UIDDocuments
                JOIN EnteringStatus t3 ON t3.ID = t2.IDEnteringStatus
                WHERE t3.Status != -1 AND t3.EntID = $EntID ";
      if (isset($_GET['doc_id'])) {
        if ((strlen($_GET['doc_id']) > 0) && (strlen($_GET['doc_id']) < 3)) {
          $doc_id = $_GET['doc_id'];
          $sql .= " AND t1.IDDocuments = $doc_id";
          get_uploaded_list_doc_id_sql_exec($sql, $link);
        } else {
          output_json_and_die(0, 'Не верный идентификатор документа');
        }
      }

      get_uploaded_list_sql_exec($sql, $link);
    } else {
      output_json_and_die(0, 'Не верный EntID');
    }
  } elseif ($_GET['action'] == 'post') {

    if ((strlen($_POST['id']) > 0) && (strlen($_POST['id']) < 3)) {
      $id = $_POST['id'];
    } else {
      output_json_and_die(0, 'Не верный id');
    }

    if ((strlen($_POST['EntID']) > 0) && (strlen($_POST['EntID']) < 10)) {
      $EntID = $_POST['EntID'];
    } else {
      output_json_and_die(0, 'Не верный EntID');
    }
    if (isset($_FILES['file'])) {
      $file = $_FILES['file']['tmp_name'];
      $type = $_FILES['file']['type'];
    } else {
      output_json_and_die(0, 'Не верный файл');
    }
    if ($type != "application/pdf") {
      output_json_and_die(0, 'Неверный формат файла');
    }
    if (!strlen($msg) > 0) {
      $data = file_get_contents($file);
      $base64 = 'data:' . $type . ';base64,' . base64_encode($data); //echo $base64;
      // sql >>
      $sql = "
            DECLARE @UIDDocuments UNIQUEIDENTIFIER  = NEWID()

            INSERT INTO [dbo].[Documents]
            ( [UID],[IDDocuments],[Documents],[HDateOfSubmit])
            VALUES (@UIDDocuments,'" . $id . "','" . $base64 . "',GETDATE())

            DECLARE @ID INT = (SELECT TOP (1) ID
            FROM [dbo].[EnteringStatus]
            WHERE EntID =" . $EntID . " AND [Status] != '-1' )

            DECLARE @UID UNIQUEIDENTIFIER = (SELECT t1.UID FROM [dbo].[Documents] t1 INNER JOIN [dbo].[DocumentsEnteringStatus] t2 ON t1.UID = t2.UIDDocuments AND IDDocuments = '" . $id . "'
                                            INNER JOIN [dbo].[EnteringStatus] t3 ON t2.IDEnteringStatus = t3.ID
                            WHERE EntID =" . $EntID . " AND [Status] != '-1' )

            DELETE [dbo].[DocumentsEnteringStatus]
            WHERE IDEnteringStatus IN
            (SELECT ID
            FROM [dbo].[EnteringStatus]
            WHERE EntID = " . $EntID . " AND Status != '-1' ) AND UIDDocuments  = @UID AND [IDDictionaryDocumentsSeaport] = 0

            INSERT INTO [dbo].[DocumentsEnteringStatus]
            VALUES (@UIDDocuments,@ID,0,NULL)";
      if (exec_sql($sql, $link) == 1) output_json_and_die(1, 'Успешно отправлено');
      unlink($file);
      output_json_and_die(0, 'SQL: Ошибка при отправке документа');

    }
  } else output_json_and_die(0, 'Не верное действие');

  /** ***********************
 [2] sudoothod [судоОтход]
   ***************************/
} elseif ($_GET['component'] == 'sudoothod') {

  if ($_GET['get_list'] == 1) {
    $sql = get_list_sql_create(1);
    get_list_sql_exec($sql, $link);
  }

  if ($_GET['action'] == 'get_uploaded_list') {
    if ((strlen($_GET['EntID']) > 0) && (strlen($_GET['EntID']) < 10)) {
      $EntID = $_GET['EntID'];
      $sql = "SELECT t1.[UID]
                ,t1.[Documents] ,t1.[IDDocuments] ,t1.[HDateOfSubmit]
                FROM Documents as t1
                JOIN DocumentsEnteringStatus as t2 ON t1.UID = t2.UIDDocuments
                JOIN EnteringStatus t3 ON t3.ID = t2.IDEnteringStatus
                WHERE t3.Status = '-1' AND t3.EntID = $EntID ";
      if (isset($_GET['doc_id'])) {
        if ((strlen($_GET['doc_id']) > 0) && (strlen($_GET['doc_id']) < 3)) {
          $doc_id = $_GET['doc_id'];
          $sql .= " AND t1.IDDocuments = $doc_id";

          get_uploaded_list_doc_id_sql_exec($sql, $link);
        } else {
          output_json_and_die(0, 'Не верный doc_id');
        }
      }

      get_uploaded_list_sql_exec($sql, $link); //происходит DIE();

    } else {
      output_json_and_die(0, 'Не верный EntID');
    }
  } elseif ($_GET['action'] == 'post') {

    if ((strlen($_POST['id']) > 0) && (strlen($_POST['id']) < 3)) {
      $id = $_POST['id'];
    } else {
      output_json_and_die(0, 'Не верный id;');
    }

    if ((strlen($_POST['EntID']) > 0) && (strlen($_POST['EntID']) < 10)) {
      $EntID = $_POST['EntID'];
    } else {
      output_json_and_die(0, 'Не верный EntID;');
    }
    if (isset($_FILES['file'])) {
      $file = $_FILES['file']['tmp_name'];
      $type = $_FILES['file']['type'];
    } else {
      output_json_and_die(0, 'Не верный файл;');
    }
    if ($type != "application/pdf") {
      output_json_and_die(0, 'Неверный формат файла;');
    }
    if (!strlen($msg) > 0) {
      $data = file_get_contents($file);
      $base64 = 'data:' . $type . ';base64,' . base64_encode($data); //echo $base64;
      // sql >>
      $sql = "
            DECLARE @UIDDocuments UNIQUEIDENTIFIER  = NEWID()

            INSERT INTO [dbo].[Documents]
            ( [UID],[IDDocuments],[Documents],[HDateOfSubmit])
            VALUES (@UIDDocuments,'" . $id . "','" . $base64 . "',GETDATE())

            DECLARE @ID INT = (SELECT TOP (1) ID
            FROM [dbo].[EnteringStatus]
            WHERE EntID =" . $EntID . " AND [Status] = '-1' )

            DECLARE @UID UNIQUEIDENTIFIER = (SELECT t1.UID FROM [dbo].[Documents] t1 INNER JOIN [dbo].[DocumentsEnteringStatus] t2 ON t1.UID = t2.UIDDocuments AND IDDocuments = '" . $id . "'
                                            INNER JOIN [dbo].[EnteringStatus] t3 ON t2.IDEnteringStatus = t3.ID
                            WHERE EntID =" . $EntID . " AND [Status] = '-1' )

            DELETE [dbo].[DocumentsEnteringStatus]
            WHERE IDEnteringStatus IN
            (SELECT ID
            FROM [dbo].[EnteringStatus]
            WHERE EntID = " . $EntID . " AND Status = '-1' ) AND UIDDocuments  = @UID  AND [IDDictionaryDocumentsSeaport] = 1

            INSERT INTO [dbo].[DocumentsEnteringStatus]
            VALUES (@UIDDocuments,@ID,1,NULL)";
      if (exec_sql($sql, $link) == 1) output_json_and_die(1, 'Успешно отправлено;');
      unlink($file);
      output_json_and_die(0, 'SQL: Ошибка при отправке документа;');
    }
  } else output_json_and_die(0, 'Не верное действие;');


  /** ***********************
 [3] sudos [судоС]
   ***************************/
} elseif ($_GET['component'] == 'sudos') {

  if ($_GET['get_list'] == 1) {
    $sql = get_list_sql_create(2);
    get_list_sql_exec($sql, $link);
  }

  if ($_GET['action'] == 'get_uploaded_list') {
    if ((strlen($_GET['EntID']) > 0) && (strlen($_GET['EntID']) < 10)) {
      $EntID = $_GET['EntID'];
      $sql = "
                SELECT t1.[UID]
                ,t1.[Documents] ,t1.[IDDocuments] ,t1.[HDateOfSubmit]
                FROM Documents as t1
                JOIN DocumentsEnteringStatus as t2 ON t1.UID = t2.UIDDocuments
                JOIN WaterArea t3 ON t3.ID = t2.IDWaterArea
                WHERE t3.ID = $EntID  ";
      if (isset($_GET['doc_id'])) {
        if ((strlen($_GET['doc_id']) > 0) && (strlen($_GET['doc_id']) < 3)) {
          $doc_id = $_GET['doc_id'];
          $sql .= " AND t1.IDDocuments = $doc_id";
          get_uploaded_list_doc_id_sql_exec($sql, $link);
        } else {
          output_json_and_die(0, 'Не верный doc_id;');
        }
      }

      get_uploaded_list_sql_exec($sql, $link);
    } else {
      output_json_and_die(0, 'Не верный EntID;');
    }
  } elseif ($_GET['action'] == 'post') {

    if ((strlen($_POST['id']) > 0) && (strlen($_POST['id']) < 3)) {
      $id = $_POST['id'];
    } else {
      output_json_and_die(0, 'Не верный id;');
    }

    if ((strlen($_POST['EntID']) > 0) && (strlen($_POST['EntID']) < 10)) {
      $EntID = $_POST['EntID'];
    } else {
      output_json_and_die(0, 'Не верный EntID;');
    }
    if (isset($_FILES['file'])) {
      $file = $_FILES['file']['tmp_name'];
      $type = $_FILES['file']['type'];
    } else {
      output_json_and_die(0, 'Не верный файл;');
    }
    if ($type != "application/pdf") {
      $msg .= 'Неверный формат файла! ';
    }
    if (!strlen($msg) > 0) {
      $data = file_get_contents($file);
      $base64 = 'data:' . $type . ';base64,' . base64_encode($data); //echo $base64;
      // sql >>
      $sql = "
            DECLARE @UIDDocuments UNIQUEIDENTIFIER  = NEWID()

            INSERT INTO [dbo].[Documents]
            ( [UID],[IDDocuments],[Documents],[HDateOfSubmit])
            VALUES (@UIDDocuments,'" . $id . "','" . $base64 . "',GETDATE())

            DECLARE @ID INT = (SELECT TOP (1) ID
            FROM [dbo].[WaterArea]
            WHERE ID =" . $EntID . " )

            DECLARE @UID UNIQUEIDENTIFIER = (SELECT t1.UID FROM [dbo].[Documents] t1 INNER JOIN [dbo].[DocumentsEnteringStatus] t2 ON t1.UID = t2.UIDDocuments AND IDDocuments = '" . $id . "'
                                            INNER JOIN [dbo].[WaterArea] t3 ON t2.IDWaterArea = t3.ID
                            WHERE ID =" . $EntID . " )

            DELETE [dbo].[DocumentsEnteringStatus]
            WHERE IDEnteringStatus IN
            (SELECT ID
            FROM [dbo].[WaterArea]
            WHERE ID = " . $EntID . ") AND UIDDocuments  = @UID   AND [IDDictionaryDocumentsSeaport] = 2

            INSERT INTO [dbo].[DocumentsEnteringStatus]
            VALUES (@UIDDocuments,NULL,2,@ID)";

            if (exec_sql($sql, $link) == 1) output_json_and_die(1, 'Успешно отправлено;');
            unlink($file);
            output_json_and_die(0, 'SQL: Ошибка при отправке документа;');
    }
  } else output_json_and_die(0, 'Не верное действие;');

  /** ***********************
 [4] ships [шипс]
   ***************************/
} elseif ($_GET['component'] == 'ships') {

  if ($_GET['get_list'] == 1) {
    $sql = "SELECT *, ID Number FROM  [dbo].[DictionaryDocuments]";
    get_list_sql_exec($sql, $link);
  } // !!! здесь происходит die !!!!;

  if ($_GET['action'] == 'get_uploaded_list') {
    if ((strlen($_GET['EntID']) > 0) && (strlen($_GET['EntID']) < 10)) {
      $EntID = $_GET['EntID'];
      $sql = "
	        SELECT t1.[UID]
                ,t1.[Documents] ,t1.[IDDocuments] ,t1.[HDateOfSubmit]
                FROM Documents as t1
                JOIN DocumentsShips as t2 ON t1.UID = t2.UIDDocuments
                WHERE t2.IDShips = $EntID  ";
      if (isset($_GET['doc_id'])) {
        if ((strlen($_GET['doc_id']) > 0) && (strlen($_GET['doc_id']) < 3)) {
          $doc_id = $_GET['doc_id'];
          $sql .= " AND t1.IDDocuments = $doc_id";
          get_uploaded_list_doc_id_sql_exec($sql, $link);
        } else {
          output_json_and_die(0, 'Не верный doc_id;');
        }
      }

      get_uploaded_list_sql_exec($sql, $link);
    } else {
      output_json_and_die(0, 'Не верный EntID;');
    }
  } elseif ($_GET['action'] == 'post') {

    if ((strlen($_POST['id']) > 0) && (strlen($_POST['id']) < 3)) $id = $_POST['id'];
    else output_json_and_die(0, 'Не верный id;');

    if ((strlen($_POST['EntID']) > 0) && (strlen($_POST['EntID']) < 10)) $EntID = $_POST['EntID'];
    else output_json_and_die(0, 'Не верный EntID;');
    if (isset($_FILES['file'])) {
      $file = $_FILES['file']['tmp_name'];
      $type = $_FILES['file']['type'];
    } else output_json_and_die(0, 'Не верный файл;');

    if ($type != "application/pdf") { output_json_and_die(0, 'Неверный формат файла '); }

      if (!strlen($msg) > 0) {
        $data = file_get_contents($file);
        $base64 = 'data:' . $type . ';base64,' . base64_encode($data); //echo $base64;

        $sql = "
            DECLARE @UIDDocuments UNIQUEIDENTIFIER  = NEWID()

            INSERT INTO [dbo].[Documents]
            ( [UID],[IDDocuments],[Documents],[HDateOfSubmit])
            VALUES (@UIDDocuments,'" . $id . "','" . $base64 . "',GETDATE())

            DECLARE @ID INT = (SELECT TOP (1) ID
            FROM [dbo].[WaterArea]
            WHERE ID =" . $EntID . " )

            DECLARE @UID UNIQUEIDENTIFIER = (SELECT t1.UID FROM [dbo].[Documents] t1 INNER JOIN [dbo].[DocumentsEnteringStatus] t2 ON t1.UID = t2.UIDDocuments AND IDDocuments = '" . $id . "'
                                            INNER JOIN [dbo].[WaterArea] t3 ON t2.IDEnteringStatus = t3.ID
                            WHERE ID =" . $EntID . " )

            DELETE [dbo].[DocumentsEnteringStatus]
            WHERE IDEnteringStatus IN
            (SELECT ID
            FROM [dbo].[WaterArea]
            WHERE ID = " . $EntID . ") AND UIDDocuments  = @UID   AND [IDDictionaryDocumentsSeaport] = 2

            INSERT INTO [dbo].[DocumentsEnteringStatus]
            VALUES (@UIDDocuments,NULL,2,@ID)";

            if (exec_sql($sql, $link) == 1) output_json_and_die(1, 'Успешно отправлено;');
            unlink($file);
            output_json_and_die(0, 'SQL: Ошибка при отправке документа;');
    }
  } else output_json_and_die(0, 'Не верный action');
}

  output_json_and_die(0, 'Неизвестный компонент');


/*********
FUNCTIONS
 ***********/

function output_json_and_die($status, $msg)
{
  $arr = ['status' => $status, 'msg' => $msg];
  header("Content-Type: application/json");
  echo json_encode($arr);
  die();
};


function exec_sql($sql, $link) {
  $stmt = $link->prepare($sql);
  try { $stmt->execute();     $stmt->fetch(); return 1;}
  catch (PDOException $e) { return output_json_and_die(0, $e); }
}

/* ПОДТВЕРЖДЕНИЕ */
function sign_doc_exec($link) {
  if ((strlen($_GET['EntID']) > 0) && (strlen($_GET['EntID']) < 10) && (strlen($_GET['id']) > 0) && (strlen($_GET['id']) < 10)) {
    $EntID = $_GET['EntID'];
    $id = $_GET['id'];
    $sql = "DECLARE @UID UNIQUEIDENTIFIER = (SELECT t1.UID FROM [dbo].[Documents] t1 INNER JOIN [dbo].[DocumentsEnteringStatus] t2 ON t1.UID = t2.UIDDocuments AND IDDocuments='$id'
            INNER JOIN [dbo].[EnteringStatus] t3 ON t2.IDEnteringStatus = t3.ID
            WHERE EntID=$EntID AND [Status] != '-1' )
            DELETE [dbo].[DocumentsEnteringStatus]
            WHERE IDEnteringStatus IN (
              SELECT ID
              FROM [dbo].[EnteringStatus]
              WHERE EntID=$EntID AND Status != '-1'
            )
            AND UIDDocuments  = @UID
            AND [IDDictionaryDocumentsSeaport] = 0";
    if (exec_sql($sql, $link) == 1) output_json_and_die(1, 'Документ успешно удален;');
    output_json_and_die(0, 'SQL: Ошибка при удалении документа;');
  }
  output_json_and_die(0, 'Не верный EntID или ID документа ');
}
/* ОТМЕНА ПОДТВЕРЖДЕНИЯ */
function unsign_doc_exec($link) {
  if ((strlen($_GET['EntID']) > 0) && (strlen($_GET['EntID']) < 10) && (strlen($_GET['id']) > 0) && (strlen($_GET['id']) < 10)) {
    $EntID = $_GET['EntID'];
    $id = $_GET['id'];
    $sql = "DECLARE @UID UNIQUEIDENTIFIER = (SELECT t1.UID FROM [dbo].[Documents] t1 INNER JOIN [dbo].[DocumentsEnteringStatus] t2 ON t1.UID = t2.UIDDocuments AND IDDocuments='$id'
            INNER JOIN [dbo].[EnteringStatus] t3 ON t2.IDEnteringStatus = t3.ID
            WHERE EntID=$EntID AND [Status] != '-1' )
            DELETE [dbo].[DocumentsEnteringStatus]
            WHERE IDEnteringStatus IN (
              SELECT ID
              FROM [dbo].[EnteringStatus]
              WHERE EntID=$EntID AND Status != '-1'
            )
            AND UIDDocuments  = @UID
            AND [IDDictionaryDocumentsSeaport] = 0";
    if (exec_sql($sql, $link) == 1) output_json_and_die(1, 'Документ успешно удален;');
    output_json_and_die(0, 'SQL: Ошибка при удалении документа;');
  }
  output_json_and_die(0, 'Не верный EntID или ID документа ');
}

/* УДАЛЕНИЕ ДОКУМЕНТА */
function delete_doc_exec($link) {
  if ((strlen($_GET['EntID']) > 0) && (strlen($_GET['EntID']) < 10) && (strlen($_GET['id']) > 0) && (strlen($_GET['id']) < 10)) {
    $EntID = $_GET['EntID'];
    $id = $_GET['id'];
    $sql = "DECLARE @UID UNIQUEIDENTIFIER = (SELECT t1.UID FROM [dbo].[Documents] t1 INNER JOIN [dbo].[DocumentsEnteringStatus] t2 ON t1.UID = t2.UIDDocuments AND IDDocuments='$id'
            INNER JOIN [dbo].[EnteringStatus] t3 ON t2.IDEnteringStatus = t3.ID
            WHERE EntID=$EntID AND [Status] != '-1' )
            DELETE [dbo].[DocumentsEnteringStatus]
            WHERE IDEnteringStatus IN (
            SELECT ID
            FROM [dbo].[EnteringStatus]
            WHERE EntID=$EntID AND Status != '-1'
            )
            AND UIDDocuments  = @UID
            AND [IDDictionaryDocumentsSeaport] = 0";
    if (exec_sql($sql, $link) == 1) output_json_and_die(1, 'Документ успешно удален;');
    output_json_and_die(0, 'SQL: Ошибка при удалении документа;');
  }
  output_json_and_die(0, 'Не верный EntID или ID документа ');
}



function get_list_sql_create($t1_id)
{
  $sql = "SELECT t2.* , t1.Number FROM [dbo].[DictionaryDocumentsSeaport] t1 INNER JOIN [dbo].[DictionaryDocuments] t2 ON t1.IDDictionaryDocuments = t2.ID WHERE t1.ID = $t1_id";
  return $sql;
}
function get_list_sql_exec($sql, $link)
{
  try {
    $stmt = $link->prepare($sql);
    $stmt->execute();

    if (isset($_GET['json']) && $_GET['json'] == 1) {
      /******UPDATE 10.06.2019*******/
      $arr = [];
      while ($row = $stmt->fetch()) {
        $arr["id" . $row['ID']] = [
          'title'    =>  $row['Number'] . '. ' . $row['Name'],
          'loaded'  =>  0
        ];
      };
      header("Content-Type: application/json");
      echo json_encode($arr);
      die;
    }
    /******OLD WAY (4 legacY) *******/

    $a = '{';
    while ($row = $stmt->fetch()) {
      $a .= "id" . $row['ID'] . ":{title:'" . $row['Number'] . '. ' . $row['Name'] . "',loaded:0},";
    };
    mb_substr($a, 0, -1);
    $a .= '}';
  } catch (PDOException $e) {
    output_json_and_die(0, 'Ошибка с SQL');
  } //.$e;
  echo json_encode($a);
  die();
}



function  get_uploaded_list_doc_id_sql_exec($sql, $link)
{
  $stmt = $link->prepare($sql);
  try {
    $stmt->execute();
    while ($row = $stmt->fetch()) {
      $msg = $row['Documents'];
      header('Content-Type: application/pdf');
      //   header('Content-Disposition: attachment; filename="Document-'.$_GET['doc_id'].'.pdf"');
      $msg = str_replace('data:application/pdf;base64,', '', $msg);
      echo (base64_decode($msg));
      die();
    };
    echo '<h1>Документ не найден!</h1>';
    die();
  } catch (PDOException $e) {
    output_json_and_die(0, 'Ошибка с SQL');
  } //.$e;
}

function get_uploaded_list_sql_exec($sql, $link)
{
  $stmt = $link->prepare($sql);
  try {
    $stmt->execute();
    while ($row = $stmt->fetch()) {
      $msg .= strlen($msg) > 0 ? ',' : ''; //if(strlen($msg)>0){$msg .= ',';}
      $msg .= $row['IDDocuments']; //'Data is Successifully Fetched from msSQL-db';
    };
  } catch (PDOException $e) {
    output_json_and_die(0, 'Ошибка с SQL');
  } //.$e;
  output_json_and_die(1, $msg);
}
