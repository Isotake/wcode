<?php
require('./mainfile.php');
require('./include/general_function.php');
require('./class/app.class.php');

$req_mode = 'read';
$dbg = true;
require('./class/database.class.php');
$db = DatabaseFactory::getDatabaseConnection($req_mode, $dbg);

$app = new AppSearch($db);
$app->rawParameter();

$app->reqParameter();
/*
$app->req_data['searchMode'] = 'prevto';
$app->req_data['offset'] = 10;
$app->req_data['maxrow'] = 30;
$app->req_data['item_num'] = 60;
*/

$app->convParameter();
/*
$app->app_data['searchMode'] = 'prevto';
$app->app_data['offset'] = 10;
$app->app_data['maxrow'] = 30;
$app->app_data['item_num'] = 60;
$app->app_data['tagon'] = [];
$app->app_data['tagoff'] = [];
$app->app_data['kword'] = [];
*/
$_mode = $app->app_data['searchMode'];
switch($_mode){
	case 'onload':
	case 'search':
		$app->makeRecordArray();
		$app->makeTagArray();
		$app->makeListCount();
		break;
	case 'prevto':
	case 'nextto':
		$app->makeRecordArray();
		break;
	case 'count':
		$app->makeListCount();
		break;
	case 'taglist':
		$app->makeTagArray();
		break;
	default:
		$app->log[] = 'invalid searchMode #1';
		break;
}
$app->makeResultData();
//$app->rst_data['dbg'] = null;
$app->rst_data['dbg'] = $app->app_data;

if($_mode == 'taglist'){
//	echo implode('\n', $app->rst_data['tags']); << NG
	echo implode("\n", $app->rst_data['tags']);
} elseif($_mode == 'nextto' || $_mode == 'prevto'){
	echo json_encode(array(
		'record' => $app->rst_data['records']
	,	'mode' => $app->rst_data['searchMode']
	,	'item_num_from' => $app->rst_data['item_num_from']
	,	'item_num' => $app->rst_data['item_num']
	,	'item_num_to' => $app->rst_data['item_num_to']
//	,	'dbg' => (isset($app->rst_data['dbg'])) ? $app->rst_data['dbg'] : ''
	,	'dbg' => $app->rst_data
	));
} else {
	echo json_encode(array(
		'record' => $app->rst_data['records']
	,	'mode' => $app->rst_data['searchMode']
	,	'tag' => $app->rst_data['tags']
	,	'listCount' => $app->rst_data['count']
	,	'item_num_from' => $app->rst_data['item_num_from']
	,	'item_num' => $app->rst_data['item_num']
	,	'item_num_to' => $app->rst_data['item_num_to']
	,	'dbg' => (isset($app->rst_data['dbg'])) ? $app->rst_data['dbg'] : ''
	));
}
?>
