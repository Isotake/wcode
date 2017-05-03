<?php
$ua = $_SERVER['HTTP_USER_AGENT'];
if(strpos($ua, 'AppleWebKit') === false){
	header('Location: index_nosupport.php');
	exit();
}

// v2.13 
$request_uri = (isset($_SERVER['SCRIPT_URL'])) ? $_SERVER['SCRIPT_URL'] : '' ;
$http_host = $_SERVER['HTTP_HOST'];
if($request_uri == '/wcode/' || $request_uri == '/wcode/ja/'){
	$link_en = 'http://'.$http_host.'/wcode/';
	$link_ja = 'http://'.$http_host.'/wcode/ja/';
} else {
	$link_en = 'http://'.$http_host.'/wcode/';
	$link_ja = 'http://'.$http_host.'/wcode/index.php?lang=ja';
}

require('./mainfile.php');
require('./include/general_function.php');
require('./class/app.class.php');

$req_mode = 'read';
$dbg = false;
require('./class/database.class.php');
$db = DatabaseFactory::getDatabaseConnection($req_mode, $dbg);

$app = new App($db);
$app->rawParameter();
$app->reqParameter();
$app->convParameter();
$app->makeRecordArray();
$app->makeTagArray();
$app->makeListCount();
$app->makeResultData();

$_tags = $app->rst_data['tags'];
$taglist = [];
foreach($_tags as $_tag){
	$_ex = explode(':', $_tag);
	if(sizeof($_ex) == 1){
		$_idname = $_tag.'-';
		$_keyname = $_tag;
	} else {
		$_idname = implode('-', $_ex);
		$_keyname = $_ex[1];
	}

	$taglist[$_tag] = [
		'id_name' => $_idname
	,	'key_name' => $_keyname
	,	'full_name' => $_tag
	,	'class_name' => 'tagNeutral'
	];
}

if(isset($app->req_data['tagon'])){
	$_on = $app->req_data['tagon'];
	foreach($_on as $_tag){
		if($taglist[$_tag]){
			$taglist[$_tag]['class_name'] = 'tagOn';
		}
	}
}

if(isset($app->req_data['tagoff'])){
	$_off = $app->req_data['tagoff'];
	foreach($_off as $_tag){
		$_ex = explode(':', $_tag);
		if(sizeof($_ex) == 1){
			$_idname = $_tag.'-';
			$_keyname = $_tag;
		} else {
			$_idname = implode('-', $_ex);
			$_keyname = $_ex[1];
		}

		$taglist[$_tag] = [
			'id_name' => $_idname
		,	'key_name' => $_keyname
		,	'full_name' => $_tag
		,	'class_name' => 'tagOff'
		];
	}
}

require_once './languages/main.php';

require_once './class/template.class.php';
$template = new Template();

$template->pretag_tagon = ($app->req_data['tagon']) ? json_encode($app->req_data['tagon']) : json_encode(array()) ;
$template->pretag_tagoff = ($app->req_data['tagoff']) ? json_encode($app->req_data['tagoff']) : json_encode(array()) ;
$template->prelist_tagoff = ($app->rst_data['tags']) ? json_encode($app->rst_data['tags']) : json_encode(array()) ;

$template->tagon = $app->req_data['tagon'];
$template->tagoff = $app->req_data['tagoff'];
$template->kword = $app->rst_data['kword'];


$template->item_num_from = $app->rst_data['item_num_from'];
$template->item_num = $app->rst_data['item_num'];
$template->item_num_to = $app->rst_data['item_num_to'];
$template->maxrow = $app->rst_data['maxrow'];

$template->records = ($app->rst_data['records']) ? $app->rst_data['records'] : array(array('title' => '', 'desc' => '', 'url' => '', 'taglist' => '')) ;
$template->tagArray = $taglist;
$template->count = $app->rst_data['count'];

$template->link_home = '//'.$_SERVER['HTTP_HOST'];
$template->link_en = $link_en;
$template->link_ja = $link_ja;
$template->debug_output = (isset($debug_output)) ? $debug_output : '' ;
$template->show('./templates/theme.html');

?>
