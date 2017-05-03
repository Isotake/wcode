<?php
class App {
	public $db = null;
	public $log = [];

	public $raw_data = [];
	public $req_data = [];
	public $app_data = [];
	public $rst_data = [];
	function __construct($_db){
		$this->db = $_db;

		$this->raw_data = array(
			'searchMode' => null
		,	'tagon' => null
		,	'tagoff' => null
		,	'kword' => null
		,	'offset' => null
		,	'maxrow' => null
		,	'item_num' => null
		,	'date' => null
		);

		$this->req_data = array(
			'searchMode' => null
		,	'tagon' => null
		,	'tagoff' => null
		,	'kword' => null
		,	'offset' => null
		,	'maxrow' => null
		,	'item_num' => null
		,	'date' => null
		);

		$this->app_data = array(
			'searchMode' => 'init'
		,	'tagon' => []
		,	'tagoff' => []
		,	'kword' => []
		,	'offset' => 0
		,	'maxrow' => 10
		,	'item_num' => null
		,	'date' => null
		);

		$this->rst_data = array(
			'records' => []
		,	'tags' => []
		,	'count' => 0
		,	'item_num_from' => 0 //$app_data['offset']
		,	'item_num_to' => 0 //$app_data['offset'] + ['maxrow']
		,	'item_num' => null
		,	'raw_data' => null
		,	'req_data' => null
		,	'app_data' => null
		,	'dbg' => null
		);
	}

	function rawParameter(){
/*
$_GETはすでにデコードされているので、urldecodeは不要。
*/
		if(isset($_GET['searchMode'])){
			$this->raw_data['searchMode'] = $_GET['searchMode'];
		}
		if(isset($_GET['tagon'])){
			$this->raw_data['tagon'] = $_GET['tagon'];
		}
		if(isset($_GET['tagoff'])){
			$this->raw_data['tagoff'] = $_GET['tagoff'];
		}
		if(isset($_GET['kword'])){
			$this->raw_data['kword'] = $_GET['kword'];
		}
		if(isset($_GET['offset'])){
			$this->raw_data['offset'] = $_GET['offset'];
		}
		if(isset($_GET['maxrow'])){
			$this->raw_data['maxrow'] = $_GET['maxrow'];
		}
		if(isset($_GET['item_num'])){
			$this->raw_data['item_num'] = $_GET['item_num'];
		}
		if(isset($_GET['date'])){
			$this->raw_data['date'] = $_GET['date'];
		}
	}

	function reqParameter(){
		if($this->raw_data['searchMode']){
			$this->req_data['searchMode'] = $this->raw_data['searchMode'];
		} else {
			$this->req_data['searchMode'] = 'init';
		}
/*
GETはカンマ区切りの文字列で受け取り、カンマで配列に変換、
POSTは配列で受け取る。
各値の「前後」の全角半角スペースを除去
*/
		if($this->raw_data['tagon']){
			if($this->req_data['searchMode'] == 'init'){
				$_ex = explode(',', $this->raw_data['tagon']);
			} else {
				$_ex = $this->raw_data['tagon'];
			}
			foreach($_ex as $_val){
				$this->req_data['tagon'][] = space_trim($_val);
			}
		}
		if($this->raw_data['tagoff']){
			if($this->req_data['searchMode'] == 'init'){
				$_ex = explode(',', $this->raw_data['tagoff']);
			} else {
				$_ex = $this->raw_data['tagoff'];
			}
			foreach($_ex as $_val){
				$this->req_data['tagoff'][] = space_trim($_val);
			}
		}
/*
GETはカンマ区切りで受け取り、
POSTは半角スペース区切りで受け取ってる。
各値の「前後」の全角半角スペースを除去
修正 > GETはカンマ区切りでPOSTは半角区切りで違ってていいの？
*/
		if($this->raw_data['kword']){
			if($this->req_data['searchMode'] == 'init'){
				$_ex = explode(',', $this->raw_data['kword']);
			} else {
				$_ex = explode(' ', $this->raw_data['kword']);
			}
			foreach($_ex as $_val){
				$this->req_data['kword'][] = space_trim($_val);
			}
		}
/*
数値に変換、0以上の整数でなければ0をセット
raw_data['offset']がセットされていなければ0をセット
*/
		if($this->raw_data['offset']){
			$this->req_data['offset'] = (is_natural_and_zero(intval($this->raw_data['offset']))) ? intval($this->raw_data['offset']) : 0 ;
		} else {
			$this->req_data['offset'] = 0;
		}
/*
数値に変換、自然数でなければ10をセット
raw_data['maxrow']がセットされていなければ10をセット
*/
		if($this->raw_data['maxrow']){
			$this->req_data['maxrow'] = (is_natural(intval($this->raw_data['maxrow']))) ? intval($this->raw_data['maxrow']) : 10 ;
		} else {
			$this->req_data['maxrow'] = 10;
		}
/*
数値に変換、自然数であればセット、自然数でなければnullをセット
raw_data['item_num']がセットされていなければ、この時点ではnullのままで構わない
*/
		if($this->raw_data['item_num']){
			$this->req_data['item_num'] = (is_natural(intval($this->raw_data['item_num']))) ? intval($this->raw_data['item_num']) : null ;
		} else {
			$this->req_data['item_num'] = null;
		}
/*
dateパラメータは現時点でそのまま
*/
		if($this->raw_data['date']){
			$this->req_data['date'] = $this->raw_data['date'];
		}
	}

	function convParameter(){
		if($this->req_data['searchMode']){
			$this->app_data['searchMode'] = $this->req_data['searchMode'];
		} else {
			$this->app_data['searchMode'] = 'init';
		}
/*
タグネームをタグIDに変換
空き配列の場合、空き配列のまま
修正 > 該当のタグIDがない場合は？
*/
		$_tagon = ($this->req_data['tagon']) ? $this->req_data['tagon'] : array() ;
		$_tagoff = ($this->req_data['tagoff']) ? $this->req_data['tagoff'] : array() ;
		if(sizeof($_tagon) || sizeof($_tagoff)){
			$tagname_arr = array_merge($_tagon, $_tagoff);
			$tagname_obj = $this->db->getTagIdByTagname($tagname_arr);
			if(!sizeof($tagname_obj)){ exit('Something wrong... #1 search.php'); }
			foreach($_tagon as $_tagname){
				$this->app_data['tagon'][] = $tagname_obj[$_tagname];
			}
			foreach($_tagoff as $_tagname){
				$this->app_data['tagoff'][] = $tagname_obj[$_tagname];
			}
		}
/*
空き配列の場合、空き配列のまま
*/
		if(sizeof($this->req_data['kword'])){
			$this->app_data['kword'] = $this->req_data['kword'];
		}
/*
nullもしくは0の場合0をセット
*/
		if($this->req_data['offset']){
			$this->app_data['offset'] = $this->req_data['offset'];
		} else {
			$this->app_data['offset'] = 0;
		}
/*
nullの場合初期値10をセット
*/
		if($this->req_data['maxrow']){
			$this->app_data['maxrow'] = $this->req_data['maxrow'];
		} else {
			$this->app_data['maxrow'] = 10;
		}
/*
nullの場合0をセット
*/
		if($this->req_data['item_num']){
			$this->app_data['item_num'] = $this->req_data['item_num'];
		} else {
			$this->app_data['item_num'] = 0;
		}
/*
dateパラメータは現時点でそのまま
*/
		if($this->req_data['date']){
			$this->app_data['date'] = $this->req_data['date'];
		}

/*
nextto mode
*/
		if($this->app_data['searchMode'] == 'nextto'){
			$this->app_data['offset']+= $this->app_data['item_num'];
		}

/*
prevto mode
*/
		if($this->app_data['searchMode'] == 'prevto'){
			$_reminder = $this->app_data['offset'] - $this->app_data['maxrow'];
			if($_reminder < 0){
				$this->app_data['maxrow'] = $this->app_data['offset'];
				$this->app_data['offset'] = 0;
			} else {
				$this->app_data['offset'] = $_reminder;
			}
		}

	}

	function _getBookmarkIdArray($kword_arr, $tagon_arr, $tagoff_arr, $limit, $offset){
		return $this->db->getBookmarkIdByTagId($kword_arr, $tagon_arr, $tagoff_arr, $limit, $offset);
	}

	function _getBookmarkData($bookmarkid_arr){
/*
$bookmarkid_arrは配列か？
*/
		$req_time = $this->app_data['date'];
		return $this->db->getBookmarkDataset($bookmarkid_arr, $req_time);
	}

	function _getTagname($tagid_arr){
/*
$tagid_arrは配列か？
*/
		$req_time = $this->app_data['date'];
		return $this->db->getTagnameByTagId($tagid_arr, $req_time);
	}

	function _getThumbUrl($photoid_arr){
/*
$photoid_arrは配列か？
*/
		$req_time = $this->app_data['date'];
		return $this->db->getThumbUrlByPhotoId($photoid_arr);
	}

	function makeRecordArray(){
		$kword_arr = $this->app_data['kword'];
		$tagon_arr = $this->app_data['tagon'];
		$tagoff_arr = $this->app_data['tagoff'];
		$limit = ($this->app_data['searchMode'] == 'init' && $this->app_data['item_num'] !== 0) ? $this->app_data['item_num'] : $this->app_data['maxrow'] ;
		$offset = $this->app_data['offset'];
		$bookmarkid_array = $this->_getBookmarkIdArray($kword_arr, $tagon_arr, $tagoff_arr, $limit, $offset);
		$bookmark_data = $this->_getBookmarkData($bookmarkid_array);
		$_tags = $this->_getTagname($bookmark_data['unique_tag']);
		$_photos = $this->_getThumbUrl($bookmark_data['unique_photo']);

		$result_array = array();
		foreach($bookmarkid_array as $key => $value){
			$_val = $bookmark_data[$value];

			$_taglist = array();
			for($i=1; $i<=sizeof($_val['tag']); $i++){
				$_k = 'tag_'.$i;
				$tag_id = $_val['tag'][$_k];
				$_taglist[] = $_tags[$tag_id];
			}

			$result_array[] = array(
				'rid' => $_val['rid']
			,	'title' => $_val['title']
			,	'desc' => (isset($_val['desc'])) ? $_val['desc'] : ''
			,	'url' => $_val['url']
			,	'thumb_url' => (isset($_val['thumbnail_1'])) ? $_photos[$_val['thumbnail_1']] : ''
			,	'tags' => $_taglist
			,	'taglist' => implode(',', $_taglist)
			);
		}
		$this->rst_data['records'] = $result_array;
	}

	function makeTagArray(){
		$kword_arr = $this->app_data['kword'];
		$tagon_arr = $this->app_data['tagon'];
		$tagoff_arr = $this->app_data['tagoff'];
		$bookmarkid_array = $this->_getBookmarkIdArray($kword_arr, $tagon_arr, $tagoff_arr, null, null);
		$bookmark_data = $this->_getBookmarkData($bookmarkid_array);
		$_tags = $this->_getTagname($bookmark_data['unique_tag']);
		$_tagnames = array_values($_tags);
		sort($_tagnames);
		$this->rst_data['tags'] = $_tagnames;
	}

	function makeListCount(){
		$kword_arr = $this->app_data['kword'];
		$tagon_arr = $this->app_data['tagon'];
		$tagoff_arr = $this->app_data['tagoff'];
		$bookmarkid_array = $this->_getBookmarkIdArray($kword_arr, $tagon_arr, $tagoff_arr, null, null);
		$this->rst_data['count'] = sizeof($bookmarkid_array);
	}

	function makeResultData(){
		$this->rst_data['searchMode'] = $this->app_data['searchMode'];
		$this->rst_data['tagon'] = $this->app_data['tagon'];
		$this->rst_data['tagoff'] = $this->app_data['tagoff'];
		$this->rst_data['kword'] = $this->app_data['kword'];
		if($this->app_data['searchMode'] == 'nextto'){
			$this->rst_data['item_num_from'] = $this->req_data['offset'];
			$this->rst_data['item_num'] = $this->app_data['maxrow'] + $this->app_data['item_num'];
			$this->rst_data['item_num_to'] = $this->req_data['offset'] + $this->app_data['maxrow'] + $this->app_data['item_num'];
		} elseif($this->rst_data['searchMode'] == 'init'){
			$this->rst_data['item_num_from'] = $this->app_data['offset'];
			$this->rst_data['item_num'] = $this->app_data['item_num'];
			$this->rst_data['item_num_to'] = $this->app_data['offset'] + $this->app_data['item_num'];
		} else {
			$this->rst_data['item_num_from'] = $this->app_data['offset'];
			$this->rst_data['item_num'] = $this->app_data['maxrow'] + $this->app_data['item_num'];
			$this->rst_data['item_num_to'] = $this->app_data['offset'] + $this->app_data['maxrow'] + $this->app_data['item_num'];
		}
		$this->rst_data['maxrow'] = $this->app_data['maxrow'];

		$this->rst_data['raw_data'] = $this->raw_data;
		$this->rst_data['req_data'] = $this->req_data;
		$this->rst_data['app_data'] = $this->app_data;
	}
}

class AppSearch extends App {
	function rawParameter(){
		if(isset($_POST['searchMode'])){
			$this->raw_data['searchMode'] = $_POST['searchMode'];
		}
		if(isset($_POST['tagOnArray'])){
			$this->raw_data['tagon'] = $_POST['tagOnArray'];
		}
		if(isset($_POST['tagOffArray'])){
			$this->raw_data['tagoff'] = $_POST['tagOffArray'];
		}
		if(isset($_POST['kwords'])){
			$this->raw_data['kword'] = $_POST['kwords'];
		}
		if(isset($_POST['offset'])){
			$this->raw_data['offset'] = $_POST['offset'];
		}
		if(isset($_POST['maxrow'])){
			$this->raw_data['maxrow'] = $_POST['maxrow'];
		}
		if(isset($_POST['item_num'])){
			$this->raw_data['item_num'] = $_POST['item_num'];
		}
		if(isset($_POST['date'])){
			$this->raw_data['date'] = $_POST['date'];
		}
	}
}

?>
