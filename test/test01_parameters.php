<?php
require('../mainfile.php');
require('../include/general_function.php');
require('../class/app.class.php');

$req_mode = 'read';
$dbg = false;
require('../class/database.class.php');
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
	} else {
		$_idname = implode('-', $_ex);
	}

	$taglist[$_tag] = [
		'id_name' => $_idname
	,	'key_name' => $_tag
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
		} else {
			$_idname = implode('-', $_ex);
		}

		$taglist[$_tag] = [
			'id_name' => $_idname
		,	'key_name' => $_tag
		,	'class_name' => 'tagOff'
		];
	}
}

//var_dump($app->rst_data['records']);

/*
データ入力
	tagon、tagoffのタグネームをタグIDに変換
		$this->db->getTagIdByTagname($tagname_arr);

onLoad
	makeRecordArray
		tagon、tagoff、kword、limit、offsetの条件でbookmarkid_arrayを取得
			$this->selectRecordIdOnSearch($origin, $kwords, $on, $off, $limit, $offset);
		bookmarkid_arrayから、bookmark_dataを取得
			$this->selectDatasetById('selectBookmarkDataset', $bookmarkid_arr, null, null, $req_time, null);
		bookmark_data['unique_tag']から、tagnameを取得
			$this->selectDatasetById($origin, $tagid_arr, $key_eq, null, $req_time, $column_arr);
		bookmark_data['unique_photo']から、thumbnail_urlを取得
			$this->selectDatasetById($origin, $photoid_arr, $key_eq, null, null, $column_arr);
		出力用のデータセットに変換
	makeTagArray
		limit、offsetの条件無しでbookmarkid_arrayを取得
			$this->selectRecordIdOnSearch($origin, $kwords, $on, $off, $limit, $offset);
		bookmarkid_arrayから、bookmark_dataを取得
			$this->selectDatasetById('selectBookmarkDataset', $bookmarkid_arr, null, null, $req_time, null);
		bookmark_data['unique_tag']から、tagnameを取得
			$this->selectDatasetById($origin, $tagid_arr, $key_eq, null, $req_time, $column_arr);
	makeListCount
		limit、offsetの条件無しでbookmarkid_arrayを取得
			$this->selectRecordIdOnSearch($origin, $kwords, $on, $off, $limit, $offset);
		bookmarkid_arrayの数からカウントを取得
*/
?>
<!DOCTYPE HTML>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta http-equiv="Content-Language" content="ja">
	<meta http-equiv="Content-Script-Type" content="text/javascript">
	<meta http-equiv="Content-Style-Type" content="text/css">
	<title>test01_parameters.php</title>
	<style type="text/css">
		html, body, div, pre{
			margin:0;
			padding:0;
		}
		header,
		section,
		div {
			box-sizing: border-box;
		}
		html{
			width: 100%;
			height:101%;
		}
		body{
			width: 100%;
			height:101%;
			font: 16px/24px Meiryo,'Hiragino Kaku Gothic Pro','MS PGothic',Arial,Verdana,Sans-Serif;
		}
		#container{
			width: 1000px;
			margin: 40px auto;
		}
		table {
			width: 100%;
			border: solid 1px #000;
			border-collapse: separate;
			border-spacing: 2px;
		}
		td {
			padding: 10px;
			vertical-align: top;
		}
		td:first-child {
			width: 40%;
			border-right: solid 1px #000;
		}
	</style>
</head>
<body>
	<div id="container">
		<ul>
			<li>makeRecordArrayにおいて、searchModeがinit&&item_num!==0の時はSQLのlimitはitem_num、</li>
			<li>search、nextto、prevtoではmaxrow</li>
			<li></li>
		</ul>
		<table><tr><td>
			<ul>
				<li><a href="./test01_parameters.php">./test01_parameters.php</a>
					<ul>
						<li>パラメータなし</li>
						<li></li>
					</ul>
					<ol>
						<li>レコードの総数は？</li>
						<li>タグの総数は？</li>
						<li></li>
					</ol>
				</li>
				<li><a href="?tagon=JavaScript%3Alib">?tagon=JavaScript:lib</a>
					<ul>
						<li>tagon=JavaScript:lib</li>
						<li></li>
					</ul>
					<ol>
						<li>レコードの総数は？</li>
						<li>タグの総数は？</li>
						<li></li>
					</ol>
				</li>
				<li><a href="?tagoff=JavaScript%3Alib">?tagoff=JavaScript:lib</a>
					<ul>
						<li>tagoff=JavaScript:lib</li>
						<li></li>
					</ul>
					<ol>
						<li>レコードの総数は？</li>
						<li>タグの総数は？</li>
						<li></li>
					</ol>
				</li>
				<li><a href="?offset=0&maxrow=10&item_num=20">?offset=0&maxrow=10&item_num=20</a>
					<ul>
						<li>offset=0</li>
						<li>maxrow=10</li>
						<li>item_num=20</li>
					</ul>
					<ol>
						<li>レコードの総数は？ //20</li>
						<li>タグの総数は？</li>
						<li></li>
					</ol>
				</li>
				<li><a href="?offset=0&maxrow=30&item_num=20">?offset=0&maxrow=30&item_num=20</a>
				</li>
				<li><a href="?kword=a%2Cb">?kword=a,b</a>
					<ul>
						<li>kword=a%2cb</li>
					</ul>
					<ol>
						<li>レコードの総数は？</li>
						<li>タグの総数は？</li>
						<li></li>
					</ol>
				</li>
<!--
				<li><a href=""></a>
					<ul>
						<li></li>
					</ul>
					<ol>
						<li>レコードの総数は？</li>
						<li>タグの総数は？</li>
						<li></li>
					</ol>
				</li>
-->
			</ul>
		</td><td>
			<ul style="list-style-type: none;">
				<li>$raw_data
					<ul>
						<li>searchMode= <?php echo $app->raw_data['searchMode']; ?></li>
						<li>tagon= <?php echo print_r($app->raw_data['tagon']); ?></li>
						<li>tagoff= <?php echo print_r($app->raw_data['tagoff']); ?></li>
						<li>kword= <?php echo print_r($app->raw_data['kword']); ?></li>
						<li>item_num_from= <?php echo $app->raw_data['offset']; ?></li>
						<li>item_num= <?php echo $app->raw_data['item_num']; ?></li>
						<li>maxrow= <?php echo $app->raw_data['maxrow']; ?></li>
					</ul>
				</li>
				<li>$req_data
					<ul>
						<li>searchMode= <?php echo $app->req_data['searchMode']; ?></li>
						<li>tagon= <?php echo print_r($app->req_data['tagon']); ?></li>
						<li>tagoff= <?php echo print_r($app->req_data['tagoff']); ?></li>
						<li>kword= <?php echo print_r($app->req_data['kword']); ?></li>
						<li>item_num_from= <?php echo $app->req_data['offset']; ?></li>
						<li>item_num= <?php echo $app->req_data['item_num']; ?></li>
						<li>maxrow= <?php echo $app->req_data['maxrow']; ?></li>
					</ul>
				</li>
				<li>$app_data
					<ul>
						<li>searchMode= <?php echo $app->app_data['searchMode']; ?></li>
						<li>tagon= <?php echo print_r($app->app_data['tagon']); ?></li>
						<li>tagoff= <?php echo print_r($app->app_data['tagoff']); ?></li>
						<li>kword= <?php echo print_r($app->app_data['kword']); ?></li>
						<li>item_num_from= <?php echo $app->app_data['offset']; ?></li>
						<li>item_num= <?php echo $app->app_data['item_num']; ?></li>
						<li>maxrow= <?php echo $app->app_data['maxrow']; ?></li>
					</ul>
				</li>
				<li>$rst_data
					<ul>
						<li>searchMode= <?php echo $app->rst_data['searchMode']; ?></li>
						<li>tagon= <?php echo print_r($app->rst_data['tagon']); ?></li>
						<li>tagoff= <?php echo print_r($app->rst_data['tagoff']); ?></li>
						<li>kword= <?php echo print_r($app->rst_data['kword']); ?></li>
						<li>item_num_from= <?php echo $app->rst_data['item_num_from']; ?></li>
						<li>item_num= <?php echo $app->rst_data['item_num']; ?></li>
						<li>item_num_to= <?php echo $app->rst_data['item_num_to']; ?></li>
						<li>maxrow= <?php echo $app->rst_data['maxrow']; ?></li>
						<li></li>
						<li>sizeof($rst_data['records'])= <?php echo sizeof($app->rst_data['records']); ?></li>
						<li>sizeof($taglist)= <?php echo sizeof($taglist); ?></li>
						<li>count= <?php echo $app->rst_data['count']; ?></li>
						<li></li>
						<?php if(sizeof($app->rst_data['records'])){ foreach($app->rst_data['records'] as $record){ ?>
						<li><?php echo $record['rid'].' - '.$record['title']; ?></li>
						<?php }} ?>
					</ul>
				</li>
			</ul>
		</td></tr></table>
	</div>
</body>
</html>
