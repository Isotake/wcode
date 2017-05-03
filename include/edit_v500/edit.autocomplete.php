<?php
/*
$xoopsOption['nocommon'] = 1;
require '../../../../mainfile.php';
include '../common.php';
*/
$dbg = (isset($_GET['dbg']) && $_GET['dbg'] == '33023') ? true : false ;

require('../../mainfile.php');
$req_mode = 'read';
require('../../class/database.class.php');
$db = DatabaseFactory::getDatabaseConnection($req_mode, $dbg);

$req_time = time();
$_tagid = $db->getTagIdForBookmarklet($req_time);
$tag_data = $db->getTagnameByTagId($_tagid, $req_time);
$tagArray = array();
foreach($_tagid as $itr => $tag_id){
	$tagArray[] = $tag_data[$tag_id].'('.$tag_id.')';
}

if($dbg){
	var_dump($tagArray);
} else {
	echo json_encode($tagArray);
}
?>
