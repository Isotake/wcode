<?php
function filePutContents($name, $data){
	$rst = file_put_contents($name, $data);
	return $rst;
}

function createPhotoDataset($db_obj, $req_data){
// photo_1
	$rst_entity = $db_obj->createPhotoEntity($req_data['time']);
	if($rst_entity){
		$req_data['photo_id'] = $db_obj->getInsertId();
	} else {
		return false;
	}

	$_filename = $req_data['fname'];
	$ex_filename = explode('.', $_filename);
	$_ext = end($ex_filename);
	$data = array(
		'mediatype' => 'photo'
	,	'author' => 1
	,	'filename' => $_filename
	,	'extension' => $_ext
	,	'description' => ''
	,	'url' => '//wcode.takehaya.jp/images/'.$_filename
//	,	'url' => '//takehaya.jp/wcode/images/'.$_filename
//	,	'url' => '//tk2-222-20790.vs.sakura.ne.jp/wcode253/modules/wcode/images/'.$_filename
	);
	$rst_data = $db_obj->createPhoto($req_data['photo_id'], $data, $req_data['time']);
// thumbnail_1
	$rst_entity = $db_obj->createPhotoEntity($req_data['time']);
	if($rst_entity){
		$req_data['thumbnail_id'] = $db_obj->getInsertId();
	} else {
		return false;
	}

	$_filename = 'bg/'.$req_data['fname'];
	$ex_filename = explode('.', $_filename);
	$_ext = end($ex_filename);
	switch ($_ext){
		case 'jpg': $_extension = 'jpeg';
			break;
		default: $_extension = $_ext;
			break;
	}
	$data = array(
		'mediatype' => 'photo'
	,	'author' => 1
	,	'filename' => $_filename
	,	'extension' => $_extension
	,	'description' => ''
	,	'url' => '//wcode.takehaya.jp/images/'.$_filename
//	,	'url' => '//takehaya.jp/wcode/images/'.$_filename
//	,	'url' => '//tk2-222-20790.vs.sakura.ne.jp/wcode253/modules/wcode/images/'.$_filename
	);
	$rst_data = $db_obj->createPhoto($req_data['thumbnail_id'], $data, $req_data['time']);

	if($rst_data){
		return $req_data;
	} else {
		return false;
	}
}

function createNewTags($db_obj, $req_data){
	$req_taglist = $req_data['taglist'];
	foreach($req_taglist as $tag_name => $tag_id){
		if($tag_id == 'new'){
			$_ex = explode(':', $tag_name);
			if(sizeof($_ex) == 2){
				$parent_name = $_ex[0];
				$child_name = $_ex[1];
			} else {
				$parent_name = $_ex[0];
				$child_name = null;
			}

			$parent_id = null;
			$child_id = null;
			$arr_parent = $db_obj->getTagIdByTagname(array($parent_name));
			if(sizeof($arr_parent) == 0){

				$rst_entity = $db_obj->createFirstTagEntity($req_data['time']);
				if($rst_entity){
					$parent_id = $db_obj->getInsertId();
				} else {
					return false;
				}
				$data_parent = array(
					'tagname' => $parent_name
				,	'tagfullname' => $parent_name
				);
				$rst = $db_obj->createFirstTag($parent_id, $data_parent, $req_data['time']);
				if($rst){
				} else {
					return false;
				}

			} else if(sizeof($arr_parent) == 1){
				$parent_id = $arr_parent[$parent_name];
			} else {
				return false;
			}

			if(!$child_name){
				$new_tagid = $parent_id;
			} else {

				$rst_entity = $db_obj->create2ndTagEntity($parent_id, $req_data['time']);
				if($rst_entity){
					$child_id = $db_obj->getInsertId();
				} else {
					return false;
				}
				$data_child = array(
					'tagname' => $child_name
				,	'tagfullname' => $parent_name.':'.$child_name
				);
				$rst = $db_obj->create2ndTag($child_id, $data_child, $req_data['time']);
				if($rst){
				} else {
					return false;
				}
				
				$new_tagid = $child_id;
			}

			$req_data['taglist'][$tag_name] = $new_tagid;
		}
	}
	$req_data['tag_indexed'] = array();
	$_itr = 1;
	foreach($req_data['taglist'] as $val){
		$_key = 'tag_'.$_itr;
		$req_data['tag_indexed'][$_key] = $val;
		$_itr++;
	}
	$req_data['tags'] = array_values($req_data['taglist']);
	return $req_data;
}

function createBookmarkDataset($db_obj, $req_data){
	$rst_entity = $db_obj->createBookmarkEntity($req_data['time']);
	if($rst_entity){
		$req_data['rid'] = $db_obj->getInsertId();
	} else {
		return false;
	}

	$data = array(
		'author' => 1
	,	'title' => $req_data['title']
	,	'desc' => $req_data['desc']
	,	'url' => $req_data['url']
	,	'photo_id' => $req_data['photo_id']
	,	'thumbnail_id' => $req_data['thumbnail_id']
	,	'tag_indexed' => $req_data['tag_indexed']
	);
	$rst_data = $db_obj->createBookmark($req_data['rid'], $data, $req_data['time']);
	if($rst_data){
		return true;
	} else {
		return false;
	}
}

		require('./edit.token.php');

// Import the necessary classes
use Cartalyst\Sentinel\Native\Facades\Sentinel;
#use Cartalyst\Sentinel\Activations\EloquentActivation as Activation;
use Illuminate\Database\Capsule\Manager as Capsule;

// Include the composer autoload file
require __DIR__.'/../../vendor/autoload.php';
require('../../mainfile.php');

// Setup a new Eloquent Capsule instance
$capsule = new Capsule;
$capsule->addConnection([
	'driver'    => 'mysql',
	'host'      => 'localhost',
	'database'  => 'takehaya',
	'username'  => DB_USER,
	'password'  => DB_PASS,
	'charset'   => 'utf8',
	'collation' => 'utf8_unicode_ci',
]);
$capsule->bootEloquent();
$user = Sentinel::check();
if(!$user){
	echo '??';
	header("HTTP/1.0 404 Not Found");
	exit;
}

$dbg = false;
//$req_mode = (isset($_POST['req_mode'])) ? $_POST['req_mode'] : 'load' ;
if(isset($_POST['req_mode'])){
	$req_mode = $_POST['req_mode'];
} else if(isset($_GET['req_mode'])){
	$req_mode = $_GET['req_mode'];
} else {
	$req_mode = 'load';
	$req_title = null;
}
$req_time = time();
$req_rid = (isset($_POST['data_rid'])) ? (int)$_POST['data_rid'] : 0 ;
//$req_title = (isset($_POST['data_title'])) ? $_POST['data_title'] : null ;
if(isset($_POST['data_title'])){
	$req_title = $_POST['data_title'];
} else if(isset($_GET['req_title'])){
	$req_title = $_GET['req_title'];
} else {
	$req_title = null;
}
$req_desc = (isset($_POST['data_desc'])) ? $_POST['data_desc'] : null ;
//$req_url = (isset($_POST['data_url'])) ? $_POST['data_url'] : null ;
if(isset($_POST['data_url'])){
	$req_url = $_POST['data_url'];
} else if(isset($_GET['req_url'])){
	$req_url = $_GET['req_url'];
} else {
	$data_url = null;
}
$req_taglist = (isset($_POST['data_taglist'])) ? json_decode($_POST['data_taglist'], true) : null ;
$req_fname = (isset($_POST['fname'])) ? $_POST['fname'] : null ;
$req_image = (isset($_POST['fimage'])) ? $_POST['fimage'] : null ;

if(isset($_GET['dbg']) && $_GET['dbg'] == 'read'){
	$dbg = true;
	$req_mode = 'read';
	$req_rid = (isset($_POST['data_rid'])) ? (int)$_POST['data_rid'] : 0 ;
	$req_title = (isset($_POST['data_title'])) ? $_POST['data_title'] : '' ;
	$req_desc = (isset($_POST['data_desc'])) ? $_POST['data_desc'] : '' ;
	$req_url = (isset($_POST['data_url'])) ? $_POST['data_url'] : 'http://wcode.takehaya.jp' ;
	$req_taglist = (isset($_POST['data_taglist'])) ? json_decode($_POST['data_taglist'], true) : null ;
	$req_fname = (isset($_POST['fname'])) ? $_POST['fname'] : null ;
	$req_image = (isset($_POST['fimage'])) ? $_POST['fimage'] : null ;
} elseif(isset($_GET['dbg']) && $_GET['dbg'] == 'create'){
	$dbg = true;
	$req_mode = 'create';
	$req_time = time();
	$req_rid = 0;
	$req_title = 'Wcode';
	$req_desc = 'My Scrapbook Site for Web Design and Developments';
	$req_url = 'http://wcode.takehaya.jp';
	$req_taglist = json_decode('{"style:card":"636","a:bc":"new"}', true);
	$req_fname = 'wcode.jpg';

	require('./edit.sample_base64.php');
	$req_image =  $sample_base64;
} elseif(isset($_GET['dbg']) && $_GET['dbg'] == 'update'){
	$dbg = true;
	$req_mode = 'update';
	$req_time = time();
	$req_rid = 41820;
	$req_title = 'Wcode';
	$req_desc = 'My Scrapbook';
	$req_url = 'http://wcode.takehaya.jp';
	$req_taglist = json_decode('{"type:Gallery":"660"}', true);
//	$req_taglist = json_decode('{"type:Gallery":"660","layer:webdesign":"561","lang:Japanese":"120","grid":"24","feature":"21"}', true);
	$req_fname = null;
	$req_image = null;
}

$uploaddir = '../../images/';

$output_mode = 'init';
$output_rid = 0;
$output_title = '';
$output_desc = '';
$output_url = '';
$output_taglist = '';
$output_token = '';
$output_msg = 'URLを入力しましょう<br /><br />';
$output_msg_file = 'something to message';

if($req_mode == 'load'){
}

if($req_mode == 'read'){
	require('../../class/database.class.php');
	$db = DatabaseFactory::getDatabaseConnection($req_mode, $dbg);

	$result_array = $db->getBookmarkIdByUrl(array($req_url), $req_time);
	$num = sizeof($result_array);
	if($num == 1){
		$dataset = $db->getBookmarkDataset($result_array, $req_time);
		$output_mode = 'renew';
		$_id = $result_array[0];
		$output_rid = $db->_4disp($dataset[$_id]['rid']);
		$output_title = $db->_4disp($dataset[$_id]['title']);
		$output_desc = (isset($dataset[$_id]['desc'])) ? $db->_4disp($dataset[$_id]['desc']) : '' ;
		$output_url = $db->_4disp($dataset[$_id]['url']);

		$_tags = $db->getTagnameByTagId($dataset['unique_tag'], $req_time);
		$_tagnames = array();
		for($i=1; $i<=sizeof($dataset[$_id]['tag']) ;$i++){
			$_key = 'tag_'.$i;
			$tag_id = $dataset[$_id]['tag'][$_key];
			$_tagnames[] = $_tags[$tag_id].'('.$tag_id.')';
		}
		$output_taglist = json_encode($_tagnames);

//		require('../../../files/demo_token/edit.token.php');
//		require('./edit.token.php');
//		session_start();
		$tokenHandler = new XoopsSingleTokenHandler();
		$ticket =&$tokenHandler->create('edit',600);
		$output_token = $ticket->getHtml();

		$photo_url = $db->getThumbUrlByPhotoId($dataset['unique_photo']);
		$photo_id = $dataset['unique_photo'][0];
		$output_msg_file = '<a href="' . $photo_url[$photo_id] . '" target="_brank">サムネイルの確認</a>';
	} elseif($num > 1) {
		$output_mode = 'init';
		$output_msg.= '$req_url : '.$db->_4sql($req_url).'<br>';
		$output_msg.= 'error - mysql_num_rows';
	} elseif($num == 0) {
		$output_mode = 'new';
		$output_url = $req_url;
		$output_title = $req_title;

//		require('../../../files/demo_token/edit.token.php');
//		require('./edit.token.php');
//		session_start();
		$tokenHandler = new XoopsSingleTokenHandler();
		$ticket =&$tokenHandler->create('edit',600);
		$output_token = $ticket->getHtml();
	}
	
	if($dbg){
		var_dump($dataset);
		var_dump($output_mode);
		var_dump($output_rid);
		var_dump($output_title);
		var_dump($output_desc);
		var_dump($output_url);
		var_dump($output_taglist);
		var_dump($output_token);
		var_dump($output_msg);
		var_dump($output_msg_file);

$arr = array('Tab_3' => '3a', 'tab_21' => '1a');
natcasesort($arr);
var_dump($arr);
	}
}

if($req_mode == 'create'){

	if(!$dbg){
//		require('../../../files/demo_token/edit.token.php');
//		require('./edit.token.php');
//		session_start();
		$tokenHandler = new XoopsSingleTokenHandler();
		if($tokenHandler->autoValidate('edit')){ $output_msg.= '照合できました。<br />'; } else { exit('照合できませんでした。'); }
	}

	require('../../class/database.class.php');
	$db = DatabaseFactory::getDatabaseConnection($req_mode, $dbg);

	$req = array(
		'mode' => $req_mode
	,	'time' => $req_time
	,	'rid' => $req_rid
	,	'title' => $req_title
	,	'desc' => $req_desc
	,	'url' => $req_url
	,	'taglist' => $req_taglist
	,	'tag_indexed' => null
	,	'tags' => null
	,	'org_fname' => $req_fname
	,	'photo_id' => null
	,	'fname' => null
	,	'fimage' => $req_image
	);

	if($req['org_fname'] && $req['fimage']){
		$org_fname = $req['org_fname'];
		$ex_fname = explode('.', $org_fname);
		$_ext = end($ex_fname);
		$req['fname'] = date('YmdHis').'.'.$_ext;
		$_upload = $uploaddir.$req['fname'];

		$fdata = explode(',', $req['fimage']);
		$encodedData = str_replace(' ','+',$fdata[1]);
		$decodedData = base64_decode($encodedData);

		$result = filePutContents($_upload, $decodedData);

		if($result) {
			$output_msg.= $req['org_fname'].":uploaded successfully<br />";
		} else {
			$output_msg.= "Something went wrong. Check that the file isn't corrupted<br />";
		}

// put a full-size image in bg folder
		$_upload_bg = $uploaddir.'bg/'.$req['fname'];
		$result_bg = filePutContents($_upload_bg, $decodedData);

		if($result_bg) {
			$output_msg.= $req['org_fname']." for bg :uploaded successfully<br />";
		} else {
			$output_msg.= "Something went wrong for bg. Check that the file isn't corrupted<br />";
		}

		if($result && $result_bg){
			$req = createPhotoDataset($db, $req);
			if($req) {
				$output_msg.= $req['org_fname']." のデータセットを正常に登録しました<br />";
			} else {
				$output_msg.= "<span style='color: red;'>".$req['org_fname']." のデータセットの登録に失敗しました</span><br />";
			}
		}
	}

	if($req['taglist']){
		$req = createNewTags($db, $req);
		if(!$req) exit('error - createNewTags in edit.php');
		if($req) {
			$output_msg.= "タグを正常に登録しました<br />";
		} else {
			$output_msg.= "<span style='color: red;'>タグの登録に失敗しました</span><br />";
		}
	}

	$req = createBookmarkDataset($db, $req);
	if(!$req) exit('error - createBookmarkDataset in edit.php');
	if($req) {
		$output_msg.= "ブックマークを正常に登録しました<br />";
	} else {
		$output_msg.= "<span style='color: red;'>ブックマークの登録に失敗しました</span><br />";
	}

	if($dbg){
		var_dump($db->log);
		var_dump($req);
	}
}

if($req_mode == 'update'){

	if(!$dbg){
//		require('../../../files/demo_token/edit.token.php');
//		require('./edit.token.php');
//		session_start();
		$tokenHandler = new XoopsSingleTokenHandler();
		if($tokenHandler->autoValidate('edit')){ $output_msg.= '照合できました。<br />'; } else { exit('照合できませんでした。'); }
	}

	require('../../class/database.class.php');
	$db = DatabaseFactory::getDatabaseConnection($req_mode, $dbg);

	$req = array(
		'mode' => $req_mode
	,	'time' => $req_time
	,	'rid' => $req_rid
	,	'title' => $req_title
	,	'desc' => $req_desc
	,	'url' => $req_url
	,	'taglist' => $req_taglist
	,	'tags' => null
	,	'tag' => null
	,	'org_fname' => $req_fname
	,	'photo_id' => null
	,	'fname' => null
	,	'fimage' => $req_image
	);

	$_data = $db->getBookmarkDataset(array($req['rid']), $req['time']);
	$dataset = $_data[$req['rid']];

	if($req['taglist']){
		$req = createNewTags($db, $req);
		if(!$req) exit('error - createNewTags in edit.php');
		if($req) {
			$output_msg.= "タグを正常に登録しました<br />";
		} else {
			$output_msg.= "<span style='color: red;'>タグの登録に失敗しました</span><br />";
		}
	}

	$update_data = array();
	$_props = array('title', 'desc', 'url');
	foreach($_props as $_prop){
		if($req[$_prop] && $dataset[$_prop] && $req[$_prop] != $dataset[$_prop]){
			$update_data['change'][$_prop] = array(
				'new' => $req[$_prop]
			,	'old' => $dataset[$_prop]
			);
		} elseif(!isset($req[$_prop]) && $dataset[$_prop]){
			$update_data['delete'][$_prop] = array(
				'old' => $dataset[$_prop]
			);
		} elseif($req[$_prop] && !isset($dataset[$_prop])){
			$update_data['add'][$_prop] = array(
				'new' => $req[$_prop]
			);
		}
	}

	$req['tag'] = array();
	foreach(array_values($req['taglist']) as $itr => $tag_id){
		$cnt = $itr + 1;
		$_key = 'tag_'.$cnt;
		$req['tag'][$_key] = (int)$tag_id;
	}

	if(sizeof($req['tag']) >= sizeof($dataset['tag'])){
		foreach($req['tag'] as $_key => $_val){
			if(!isset($dataset['tag'][$_key])){
				$update_data['add'][$_key] = array(
					'new' => $req['tag'][$_key]
				);
			} elseif($dataset['tag'][$_key] != $req['tag'][$_key]){
				$update_data['change'][$_key] = array(
					'new' => $req['tag'][$_key]
				,	'old' => $dataset['tag'][$_key]
				);
			}
		}
	} else {
		foreach($dataset['tag'] as $_key => $_val){
			if(!isset($req['tag'][$_key])){
				$update_data['delete'][$_key] = array(
					'old' => $dataset['tag'][$_key]
				);
			} elseif($dataset['tag'][$_key] != $req['tag'][$_key]){
				$update_data['change'][$_key] = array(
					'new' => $req['tag'][$_key]
				,	'old' => $dataset['tag'][$_key]
				);
			}
		}
	}

	if(sizeof($update_data)){
		$insert_data = array();
		$delete_data = array();
		foreach($update_data as $key_1 => $val_1){
			if($key_1 == 'change'){
				foreach($val_1 as $key_2 => $val_2){
					$_ex = explode('_', $key_2);
					if($_ex[0] == 'tag'){
						$insert_data['tag_indexed'][$key_2] = $val_2['new'];
						$delete_data[$key_2] = $val_2['old'];
					} else {
						$insert_data[$key_2] = $val_2['new'];
						$delete_data[$key_2] = $val_2['old'];
					}
				}
			} elseif($key_1 == 'add'){
				foreach($val_1 as $key_2 => $val_2){
					$_ex = explode('_', $key_2);
					if($_ex[0] == 'tag'){
						$insert_data['tag_indexed'][$key_2] = $val_2['new'];
					} else {
						$insert_data[$key_2] = $val_2['new'];
					}
				}
			} elseif($key_1 == 'delete'){
				foreach($val_1 as $key_2 => $val_2){
					$delete_data[$key_2] = $val_2['old'];
				}
			}
		}
		if(sizeof($delete_data)){
			$rst_delete = $db->deleteRecord($req['rid'], $delete_data, $req['time']);
			if(!$rst_delete){ $output_msg.= 'bookmarkデータの更新に失敗<br />'; }
		}
		if(sizeof($insert_data)){
			$rst_update = $db->createBookmark($req['rid'], $insert_data, $req['time']);
			if(!$rst_update){ $output_msg.= 'bookmarkデータの変更に失敗<br />'; }
		}
	}

//	$change_data = array('title' => $req['title']);
//	$db->createBookmark($req['rid'], $change_data, $req['time']);

	if($dbg){
		var_dump($update_data);
		var_dump($insert_data);
		var_dump($delete_data);
		var_dump($req);
		var_dump($dataset);
		var_dump($db->log);
	}
}
?>
<!DOCTYPE HTML>  
<html>  
    <head>  
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta http-equiv="Content-Language" content="ja">
        <meta http-equiv="Content-Script-Type" content="text/javascript">
        <meta http-equiv="Content-Style-Type" content="text/css">
        <title>edit.php</title>
	<link rel="stylesheet" type="text/css" href="./tagarea.css" />
	<link rel="stylesheet" type="text/css" href="./edit.css" />
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
	<script type="text/javascript" src="./tagarea.js"></script>
	<script type="text/javascript">
	function onFileSelected(){
		var file = document.getElementById('file_select').files[0];
		var reader = new FileReader();
		reader.onloadend = function(){
			document.getElementById('fname').value = file.name;
			document.getElementById('fimage').value = this.result;
			$('.thumbArea').append('<div class="image" style="background: url(' + this.result + '); background-size: cover; width: 100%; height: 100%;"> </div>');
		};
		reader.readAsDataURL(file);
	}

	function makeTaglist(){
		var _obj = {};
		$('.tagbox span.tag').each(function(){
			var _str = $(this).text(),
			    _res = _str.match(/\((.+?)\)/),
			    _val = (_res) ? _res[1] : 'new',
			    _key = (_res) ? _str.slice(0, _res.index) : _str.slice(0, _str.length-1).trim() ;
			_obj[_key] = _val;
		});
console.log(JSON.stringify(_obj));
		$('#tlist').val(JSON.stringify(_obj));
	}

$(function(){
	$('#rectag').tagarea({
		taglist_url: 'edit.autocomplete.php',
		onAddTag: function(tagareaObj, targetObj){ /* console.log('add', tagareaObj, targetObj); */ },
		onRemoveTag: function(tagareaObj, targetObj){ /* console.log('remove', tagareaObj, targetObj); */ },
		onChangeTag: function(tagareaObj, targetObj){
			var listObj = targetObj.getListObj();
			if(listObj) listObj.toggleClass('selected');
		}
	});

	$('.submit_read').on('click', function(){ $('#submitform').click(); });

	$('.submit_create.active').on('click', function(){$('#req_mode').val('create');if(confirm('create OK?')){ makeTaglist(); $('#submitform').click(); }});
	$('.submit_update.active').on('click', function(){$('#req_mode').val('update');if(confirm('update OK?')){ makeTaglist(); $('#submitform').click(); }});
	$('.submit_delete.active').on('click', function(){$('#req_mode').val('delete');if(confirm('delete OK?')){ $('#submitform').click(); }});
});
	</script>
    </head>
    <body>
	<div id="container" style="margin: 0px auto;">
<?php if($output_mode == 'init'){ ?>
	<form action="" method="POST" id="form_init">
	<input id="submitform" type="submit" style="visibility: hidden;width: 1px;height: 1px;" />
	<input id="req_mode" type="hidden" name="req_mode" value="read" />
	<input type="hidden" name="data_rid" value="<?php echo $output_rid; ?>" />
	<?php echo $output_msg; ?>
	<div class="inputArea">
		<div class="inputForm">
			<div class="textinput"><input type="url" name="data_url" placeholder="http://～ or https://～" required /></div>
			<div class="submit_read">RUN</div>
		</div>
	</div>
<?php } elseif($output_mode == 'new' || $output_mode == 'renew') { ?>
	<div id="mainContainer">
		<div id="leftContainer">
			<form action="" method="POST" id="form_init">
			<input id="submitform" type="submit" style="visibility: hidden;width: 1px;height: 1px;" />
			<input id="req_mode" type="hidden" name="req_mode" value="read" />
			<input type="hidden" name="data_rid" value="<?php echo $output_rid; ?>" />
			<input id="fname" type="hidden" name="fname" value="">
			<input id="fimage" type="hidden" name="fimage" value="">
			<input id="tlist" type="hidden" name="data_taglist" value="">
			<?php echo $output_token; ?>
			<div style="width: 100%;">
				<div style="margin: 5px;padding: 13px;float: left;width: 380px;height: 50px;font-size: 24px;">
					<?php echo 'mode : '.$output_mode ; ?>
					<?php echo ' / rid : '.$output_rid ; ?>
				</div>
			</div>
			タイトル
			<div class="titleArea">
				<div class="titleForm">
					<div class="titleInput"><input type="text" name="data_title" value="<?php echo $output_title; ?>" required /></div>
				</div>
			</div>
			URL
			<div class="urlArea">
				<div class="urlForm">
					<div class="urlInput"><input type="text" name="data_url" value="<?php echo $output_url; ?>"></div>
				</div>
			</div>
			説明
			<div class="descArea">
				<div class="descForm">
					<div class="descInput"><textarea name="data_desc" cols="50" rows="3"><?php echo $output_desc; ?></textarea></div>
				</div>
			</div>
			スクリーンショット 
				<?php if($output_mode == 'new'){ ?>
					<span style="cursor: pointer;" onClick="document.getElementById('file_select').click();">ファイル選択</span>
					<input id="file_select" type="file" name="file" onChange="onFileSelected()" style="visibility: hidden;width: 1px;height: 1px;">
					<div class="thumbArea"></div>
				<?php } elseif($output_mode == 'renew'){ ?>
					<div class="thumbArea"><?php echo $output_msg_file; ?></div>
				<?php } ?>
			</form></div><div id="rightContainer">
			<div style="width: 100%;">
				<div class="<?php echo ($output_mode == 'renew') ? 'submit_delete active' : 'submit_delete' ; ?>">削除</div>
				<div class="<?php echo ($output_mode == 'renew') ? 'submit_update active' : 'submit_update' ; ?>">更新</div>
				<div class="<?php echo ($output_mode == 'new') ? 'submit_create active' : 'submit_create' ; ?>">登録</div>
			</div>
			タグリスト
			<div class="taglistArea">
				<div class="taglistForm">
					<div id="rectag" class="tagareabox">
						<div class="pre-tag"><?php echo $output_taglist; ?></div>
					</div>
			</div>
		</div>
	</div>
<?php } ?>
	</div>
    </body>
</html>
