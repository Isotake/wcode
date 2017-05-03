<?php
//define('DB_SERVER', '182.48.46.243:/var/lib/mysql/mysql.sock');
define('DB_SERVER', 'localhost');
//define('DB_USER', '');
//define('DB_PASS', '');
define('DB_NAME', 'takehaya');
define('DB_PREFIX', 'takehaya.wcode');

class DatabaseFactory {
	function __construct(){
	}

	public static function getDatabaseConnection($mode, $debug){
		static $instance;
		if($mode == 'read' || $mode == 'create' || $mode == 'update'){
			$instance = new wcode201501Utils();
		} else if($mode == 'convert_photourl'){
			$instance = new convertPhotoUrl();
		}

		if(!$instance->connect()){ exit('error: connect error'); }
		$instance->setPrefix(DB_PREFIX);
		$instance->setTablename('records');
		if($debug){
			$instance->debug = true;
			$instance->log = array();
		}

		return $instance;
	}
}

class Database {
	var $prefix = '';
	var $tablename = '';
	var $debug = false;
	var $log = null;

	function __construct(){
	}

	function setPrefix($value){
		$this->prefix = $value;
	}

	function prefix($tablename = ''){
		if($tablename != ''){
			return $this->prefix . '_' . $tablename;
		} else {
			return $this->prefix;
		}
	}

	function setTablename($tablename){
		$this->tablename = $this->prefix($tablename);
	}
}

class MySQLDatabase extends Database {
	var $conn;

	function __construct(){
	}

	function connect(){
		$this->conn = mysqli_connect(DB_SERVER, DB_USER, DB_PASS);
		if(!$this->conn){ return false; }
		if(!mysqli_select_db($this->conn, DB_NAME)){ return false; }
		return true;
	}

	function close(){
		$close_rst = mysqli_close($this->conn);
		if(!$close_rst){ return false; }
		return $close_rst;
/*
		$free_rst = mysqli_free_result($rst);
		if(!$free_rst){ return false; };
		mysqli_set_charset("latin1");
		$close_rst = mysqli_close();
		if(!$close_rst){ return false; }
*/
	}

	function query($sql){
		$result = mysqli_query($this->conn, $sql);
		if($result){
			return $result;
		} else {
			return false;
		}
	}

	function fetchAll($result){
		return mysqli_fetch_all($result);
	}

	function fetchArray($result){
		return mysqli_fetch_array($result);
	}

	function fetchAssoc($result){
		return mysqli_fetch_assoc($result);
	}

	function fetchObject($result){
		return mysqli_fetch_object($result);
	}

	function fetchRow($result){
		return mysqli_fetch_row($result);
	}

	function getRowsNum($result){
		return mysqli_num_rows($result);
	}

	function getInsertId(){
		return mysqli_insert_id($this->conn);
	}

	function error(){
		return mysqli_error();
	}

	function errno(){
		return mysqli_errno();
	}
/*
	function quoteString($str){
		return $this->quote($str);
	}

	function quote($string){
		return mysqli_real_escape_string($string, $this->conn);
	}
*/
	function _4sql($str){
		return mysqli_real_escape_string($this->conn, $str);
	}

	function _4disp($str){
		return htmlspecialchars(stripSlashes($str), ENT_QUOTES, 'UTF-8');
	}
}

class MySQLUtils extends MySQLDatabase {

	function __construct(){
	}

	function insert($sql){
		$result = $this->query($sql);
		if($result){
			return $result;
		} else {
			return false;
		}
	}

	function select($origin, $sql){
//		echo $sql.'<br /><br />';
		$result = $this->query($sql);
		if($result){
			return $result;
		} else {
			exit('error !! LINE: '.__LINE__.' ORIGIN: '.$origin.' SQL: '.$sql);
		}
	}

	function update($sql){
		$result = $this->query($sql);
		if($result){
			return $result;
		} else {
			return false;
		}
	}

	function delete($sql){
		$result = $this->query($sql);
		if($result){
			return $result;
		} else {
			return false;
		}
	}
}

class CommonUtils extends MySQLUtils {

	function __construct(){
	}

	function buildInsertSQL($origin, $data_array){
		$val_array = array();
		foreach($data_array as $key => $val){
			$val_string = '('.implode(',', $val).')';
			array_push($val_array, $val_string);
		}
		$sql = 'INSERT INTO '.$this->tablename.' VALUES '.implode(',', $val_array);
		if($this->debug){ $this->log[] = array('origin' => $origin, 'sql' => $sql); }
		return $this->insert($sql);
	}

	function buildUpdateSQL($origin, $data_array){
		$key_array = array();
		foreach($data_array['data'] as $val){
			$key_array[] = "`key` = {$val}";
		}

		$sql = "UPDATE {$this->tablename} SET `record_deleted` = {$data_array['delete_time']}";
		$sql.= " WHERE (`object_id` = {$data_array['object_id']} AND `record_deleted` = 4294967295) AND (";
		$sql.= implode(' OR ', $key_array);
		$sql.= ")";
		
		if($this->debug){ $this->log[] = array('origin' => $origin, 'sql' => $sql); }
		return $this->update($sql);
	}

	function selectDatasetById($origin, $id_arr, $key_eq=null, $key_like=null, $req_time=null, $column_arr=null){
		if(!$origin){
			exit('error !! - selectDatasetById #1');
		}

		if(!$id_arr){
			exit('error !! - selectDatasetById #2');
		} else {
			$comma_id = implode(',', $id_arr);
		}

		if(!$key_eq){
			$sql_key_eq = 0;
		} else {
			$eq_arr = array();
			foreach($key_eq as $_key){
				$eq_arr[] = "\"{$_key}\"";
			}
			$sql_key_eq = '`key` IN ('.implode(',', $eq_arr).')';
		}

		if(!$key_like){
			$sql_key_like = 0;
		} else {
			$like_arr = array();
			foreach($key_like as $_key){
				$like_arr[] = "(`key` LIKE \"{$_key}_%\")";
			}
			$sql_key_like = implode(' OR ', $like_arr);
		}

		if(!$req_time){
			$sql_req_time = 0;
		} else {
			$sql_req_time = "`record_created` <= {$req_time} AND `record_deleted` >= {$req_time}";
		}

		if(!$column_arr){
			$sql_column = '*';
		} else {
			$_arr = array();
			foreach($column_arr as $_column){
				$_arr[] = "`{$_column}`";
			}
			$sql_column = implode(',', $_arr);
		}

		$sql = "SELECT {$sql_column} FROM {$this->tablename}";
		$sql.= " WHERE";
		if(!!$sql_key_eq || !!$sql_key_like){
			$sql.= " ({$sql_key_eq} OR {$sql_key_like})";
			$sql.= " AND "; 
		}
		if(!!$sql_req_time){
			$sql.= " ({$sql_req_time})";
			$sql.= " AND";
		}
		$sql.= "((`record_id` IN ({$comma_id})) OR (`object_id` IN ({$comma_id})))";
		$sql.= ";";

		if($this->debug){ $this->log[] = array('origin' => $origin, 'sql' => $sql); }
//		echo $sql.'<br />';
		$result = $this->select($origin, $sql);
//		if(!$this->getRowsNum($result)){ $result = false; }
		return $result;
	}

	function selectRecordIdOnSearch($origin, $kwords, $on, $off, $limit, $offset){
		
		$clause_kwords = 1;
		if(sizeof($kwords)){
			$_arr = array();
			foreach($kwords as $val){
				$_str = "record_id IN (SELECT DISTINCT(object_id) FROM {$this->tablename}";
				$_str.= " WHERE `record_type` = 'bookmark_attr' AND (`key` = 'title' OR `key` = 'description' OR `key` = 'url')";
				$_str.= " AND `str_value` LIKE '%{$this->_4sql($val)}%'";
				$_str.= ")";
				array_push($_arr, $_str);
			}
			$clause_kwords = implode(' AND ', $_arr);
		}
		
		$clause_on = 1;
		if(sizeof($on)){
			$_arr = array();
			foreach($on as $val){
				$_str = "record_id IN (SELECT DISTINCT(object_id) FROM {$this->tablename}";
				$_str.= " WHERE `record_type` = 'bookmark_attr' AND `int_value` = {$val})";
				array_push($_arr, $_str);
			}
			$clause_on = implode(' AND ', $_arr);
		}

		$clause_off = 1;
		if(sizeof($off)){
			$_arr = array();
			foreach($off as $val){
				$_str = "record_id NOT IN (SELECT DISTINCT(object_id) FROM {$this->tablename}";
				$_str.= " WHERE `record_type` = 'bookmark_attr' AND `int_value` = {$val})";
				array_push($_arr, $_str);
			}
			$clause_off = implode(' AND ', $_arr);
		}

		$sql = "SELECT `record_id` FROM {$this->tablename}";
		$sql.= " WHERE `record_type` = 'bookmark' AND {$clause_kwords} AND {$clause_on} AND {$clause_off}";
		$sql.= " ORDER BY `record_id` DESC";

		if($limit !== null && $offset !== null){
			$sql.= " LIMIT {$limit} OFFSET {$offset}";
		}

		if($this->debug){ $this->log[] = array('origin' => $origin, 'sql' => $sql); }
//		echo $sql.'<br />';
		$result = $this->select($origin, $sql);
//		if(!$this->getRowsNum($result)){ $result = false; }
		return $result;
	}

	function selectRecordIdByStrValue($origin, $req_value){
		$clause_value = array();
		foreach($req_value as $val){
			$clause_value[] = "`str_value` = \"{$val}\"";
		}
		$sql = "SELECT `object_id`, `str_value` FROM {$this->tablename} WHERE ".implode(' OR ', $clause_value).";";

		if($this->debug){ $this->log[] = array('origin' => $origin, 'sql' => $sql); }
		$result = $this->select($origin, $sql);
//		if(!$this->getRowsNum($result)){ $result = false; }
		return $result;
	}

	function selectRecordIdByUrl($origin, $req_url, $req_time){
		$clause_value = array();
		foreach($req_url as $val){
			$clause_value[] = "`str_value` = \"{$val}\"";
		}
		$sql = "SELECT `object_id`, `str_value` FROM {$this->tablename} WHERE `record_created` <= {$req_time} AND `record_deleted` >= {$req_time}";
		$sql.= " AND `key` = 'url' AND (".implode(' OR ', $clause_value).");";

		if($this->debug){ $this->log[] = array('origin' => $origin, 'sql' => $sql); }
//		echo $sql.'<br />';
		$result = $this->select($origin, $sql);
		if(!$this->getRowsNum($result)){ $result = false; }
		return $result;
	}

	function selectTagIdForBookmarklet($origin, $req_time){
		$sql = "SELECT max(record_id) AS rec_id, int_value AS tag_id FROM {$this->tablename} WHERE `record_type` = 'bookmark_attr' AND `key` LIKE 'tag_%'";
		$sql.= " GROUP BY `int_value` ORDER BY `rec_id` DESC";

		if($this->debug){ $this->log[] = array('origin' => $origin, 'sql' => $sql); }
		$result = $this->select($origin, $sql);
		return $result;
	}
}

class wcode201501Utils extends CommonUtils {

	function __construct(){
	}

	function createPhotoEntity($req_time){
		$origin = 'createPhotoDataset';

		$array = array();
		$_arr = array(
			"null"
		,	0
		,	"\"media\""
		,	"\"entity\""
		,	"null"
		,	"null"
		,	"null"
		,	1
		,	(int)$req_time
		,	4294967295
		);
		array_push($array, $_arr);
		if($this->debug){ $this->log[] = array('origin' => $origin, 'result' => $array); }
		return $this->buildInsertSQL($origin, $array);
	}

	function createPhoto($object_id, $data, $req_time){
		$origin = 'createPhoto';

		$array = array();
		if($data['mediatype']){
			$_arr1 = array(
				"null"
			,	(int)$object_id
			,	"\"media_attr\""
			,	"\"mediatype\""
			,	"null"
			,	"null"
			,	"\"".$data['mediatype']."\""
			,	1
			,	(int)$req_time
			,	4294967295
			);
			array_push($array, $_arr1);
		}

		if($data['author']){
			$_arr2 = array(
				"null"
			,	(int)$object_id
			,	"\"media_attr\""
			,	"\"author\""
			,	"null"
			,	(int)$data['author']
			,	"null"
			,	1
			,	(int)$req_time
			,	4294967295
			);
			array_push($array, $_arr2);
		}
		if($data['filename']){
			$_arr3 = array(
				"null"
			,	(int)$object_id
			,	"\"media_attr\""
			,	"\"filename\""
			,	"null"
			,	"null"
			,	"\"".$data['filename']."\""
			,	1
			,	(int)$req_time
			,	4294967295
			);
			array_push($array, $_arr3);
		}
		if($data['extension']){
			$_arr4 = array(
				"null"
			,	(int)$object_id
			,	"\"media_attr\""
			,	"\"extension\""
			,	"null"
			,	"null"
			,	"\"".$data['extension']."\""
			,	1
			,	(int)$req_time
			,	4294967295
			);
			array_push($array, $_arr4);
		}
		if($data['description']){
			$_arr5 = array(
				"null"
			,	(int)$object_id
			,	"\"media_attr\""
			,	"\"description\""
			,	"null"
			,	"null"
			,	"null"
			,	1
			,	(int)$req_time
			,	4294967295
			);
			array_push($array, $_arr5);
		}
		if($data['url']){
			$_arr6 = array(
				"null"
			,	(int)$object_id
			,	"\"media_attr\""
			,	"\"url\""
			,	"null"
			,	"null"
			,	"\"".$data['url']."\""
			,	1
			,	(int)$req_time
			,	4294967295
			);
			array_push($array, $_arr6);
		}
		if($this->debug){ $this->log[] = array('origin' => $origin, 'result' => $array); }
		return $this->buildInsertSQL($origin, $array);
	}

	function createFirstTagEntity($req_time){
		$origin = 'createFirstTagEntity';

		$array = array();
		$_arr = array(
			"null"
		,	0
		,	"\"tag\""
		,	"\"entity\""
		,	"null"
		,	"null"
		,	"null"
		,	1
		,	(int)$req_time
		,	4294967295
		);
		array_push($array, $_arr);
		if($this->debug){ $this->log[] = array('origin' => $origin, 'result' => $array); }
		return $this->buildInsertSQL($origin, $array);
	}

	function createFirstTag($object_id, $data, $req_time){
		$origin = 'createFirstTag';

		$array = array();
		$_arr1 = array(
			"null"
		,	(int)$object_id
		,	"\"tag_attr\""
		,	"\"tagname\""
		,	"null"
		,	"null"
		,	"\"".$data['tagname']."\""
		,	1
		,	(int)$req_time
		,	4294967295
		);
		$_arr2 = array(
			"null"
		,	(int)$object_id
		,	"\"tag_attr\""
		,	"\"tag_fullname\""
		,	"null"
		,	"null"
		,	"\"".$data['tagfullname']."\""
		,	1
		,	(int)$req_time
		,	4294967295
		);
		array_push($array, $_arr1, $_arr2);
		if($this->debug){ $this->log[] = array('origin' => $origin, 'result' => $array); }
		return $this->buildInsertSQL($origin, $array);
	}

	function create2ndTagEntity($first_id, $req_time){
		$origin = 'create2ndTagEntity';

		$array = array();
		$_arr = array(
			"null"
		,	(int)$first_id
		,	"\"tag\""
		,	"\"entity\""
		,	"null"
		,	"null"
		,	"null"
		,	1
		,	(int)$req_time
		,	4294967295
		);
		array_push($array, $_arr);
		if($this->debug){ $this->log[] = array('origin' => $origin, 'result' => $array); }
		return $this->buildInsertSQL($origin, $array);
	}

	function create2ndTag($object_id, $data, $req_time){
		$origin = 'create2ndTag';

		$array = array();
		$_arr1 = array(
			"null"
		,	(int)$object_id
		,	"\"tag_attr\""
		,	"\"tagname\""
		,	"null"
		,	"null"
		,	"\"".$data['tagname']."\""
		,	1
		,	(int)$req_time
		,	4294967295
		);
		$_arr2 = array(
			"null"
		,	(int)$object_id
		,	"\"tag_attr\""
		,	"\"tag_fullname\""
		,	"null"
		,	"null"
		,	"\"".$data['tagfullname']."\""
		,	1
		,	(int)$req_time
		,	4294967295
		);
		array_push($array, $_arr1, $_arr2);
		if($this->debug){ $this->log[] = array('origin' => $origin, 'result' => $array); }
		return $this->buildInsertSQL($origin, $array);
	}

	function createBookmarkEntity($req_time){
		$origin = 'createBookmarkEntity';

		$array = array();
		$_arr = array(
			"null"
		,	0
		,	"\"bookmark\""
		,	"\"entity\""
		,	"null"
		,	"null"
		,	"null"
		,	1
		,	(int)$req_time
		,	4294967295
		);
		array_push($array, $_arr);
		if($this->debug){ $this->log[] = array('origin' => $origin, 'result' => $array); }
		return $this->buildInsertSQL($origin, $array);
	}

	function createBookmark($object_id, $data, $req_time){
		$origin = 'createBookmark';

		$array = array();
		if(isset($data['author'])){
			$_arr1 = array(
				"null"
			,	(int)$object_id
			,	"\"bookmark_attr\""
			,	"\"author\""
			,	"null"
			,	1
			,	"null"
			,	1
			,	(int)$req_time
			,	4294967295
			);
			array_push($array, $_arr1);
		}

		if(isset($data['title'])){
			$_arr2 = array(
				"null"
			,	(int)$object_id
			,	"\"bookmark_attr\""
			,	"\"title\""
			,	"null"
			,	"null"
			,	"\"".$this->_4sql($data['title'])."\""
			,	1
			,	(int)$req_time
			,	4294967295
			);
			array_push($array, $_arr2);
		}

		if(isset($data['desc'])){
			$_arr3 = array(
				"null"
			,	(int)$object_id
			,	"\"bookmark_attr\""
			,	"\"description\""
			,	"null"
			,	"null"
			,	"\"".$this->_4sql($data['desc'])."\""
			,	1
			,	(int)$req_time
			,	4294967295
			);
			array_push($array, $_arr3);
		}

		if(isset($data['url'])){
			$_arr4 = array(
				"null"
			,	(int)$object_id
			,	"\"bookmark_attr\""
			,	"\"url\""
			,	"null"
			,	"null"
			,	"\"".$data['url']."\""
			,	1
			,	(int)$req_time
			,	4294967295
			);
			array_push($array, $_arr4);
		}

		if(isset($data['photo_id'])){
			$_arr5 = array(
				"null"
			,	(int)$object_id
			,	"\"bookmark_attr\""
			,	"\"photo_1\""
			,	"null"
			,	(int)$data['photo_id']
			,	"null"
			,	1
			,	(int)$req_time
			,	4294967295
			);
			array_push($array, $_arr5);
		}

		if(isset($data['thumbnail_id'])){
			$_arr6 = array(
				"null"
			,	(int)$object_id
			,	"\"bookmark_attr\""
			,	"\"thumbnail_1\""
			,	"null"
			,	(int)$data['thumbnail_id']
			,	"null"
			,	1
			,	(int)$req_time
			,	4294967295
			);
			array_push($array, $_arr6);
		}

		if(isset($data['tag_indexed'])){
			foreach($data['tag_indexed'] as $_key => $tag_id){
				$_arr = array(
					"null"
				,	(int)$object_id
				,	"\"bookmark_attr\""
				,	"\"".$_key."\""
				,	"null"
				,	(int)$tag_id
				,	"null"
				,	1
				,	(int)$req_time
				,	4294967295
				);
				array_push($array, $_arr);
			}
		}

		if($this->debug){ $this->log[] = array('origin' => $origin, 'result' => $array); }
		return $this->buildInsertSQL($origin, $array);
	}

	function deleteRecordEntity($record_id, $delete_time){
	}

	function deleteRecord($object_id, $data, $delete_time){
		$origin = 'deleteRecord';

		$array = array();
		$array['object_id'] = $object_id;
		$array['delete_time'] = $delete_time;
		foreach($data as $key => $val){
			if($key == 'desc'){ $key = 'description'; }
			$array['data'][] = "\"".$key."\"";
		}
		
		if($this->debug){ $this->log[] = array('origin' => $origin, 'result' => $array); }
		return $this->buildUpdateSQL($origin, $array);
	}

	function getBookmarkIdByTagId($kwords, $on, $off, $limit, $offset){
		$origin = 'getBookmarkIdByTagId';

		$rst = $this->selectRecordIdOnSearch($origin, $kwords, $on, $off, $limit, $offset);
//		if(!$rst){ exit('error !! LINE: '.__LINE__.' - getBookmarkIdByTagId'); }
		$result_arr = array();
		while($col = $this->fetchArray($rst)){
			$result_arr[] = (int)$col['record_id'];
		}

		if($this->debug){ $this->log[] = array('origin' => $origin, 'result' => $result_arr); }
		return $result_arr;
	}

	function getBookmarkIdByUrl($url_array, $req_time){
		$origin = 'getBookmarkIdByUrl';

		$rst = $this->selectRecordIdByUrl($origin, $url_array, $req_time);
		$result_arr = array();
		if($rst){
			while($col = $this->fetchArray($rst)){
				$result_arr[] = (int)$col['object_id'];
			}
		}

		if($this->debug){ $this->log[] = array('origin' => $origin, 'result' => $result_arr); }
		return $result_arr;
	}

	function getBookmarkDataset($bookmarkid_arr, $req_time){
		$origin = 'getBookmarkDataset';

		$result_arr = array();
		$_tag = array();
		$_photo = array();

		$rst = $this->selectBookmarkDataset($bookmarkid_arr, $req_time);
//		if(!$rst){ exit('error !! LINE: '.__LINE__.' - getWebstackDataset'); }
		while($col = $this->fetchArray($rst)){
			$key = $col['key'];
			$ex_arr = explode('_', $key);
			$key1st = $ex_arr[0];
			$value = null;
			switch ($key1st){
				case '':
				case 'entity';
					if($col['record_type'] == 'bookmark'){
						$bookmark_id = (int)$col['record_id'];
						$key = 'bookmark_id';
						$value = (int)$col['record_id'];
						$result_arr[$bookmark_id]['rid'] = $value;
					}
					break;
				case 'title':
				case 'description':
				case 'url':
					$bookmark_id = (int)$col['object_id'];
					$key = ($key == 'description') ? 'desc' : $key ;
					$value = $col['str_value'];
/*
					$value = $this->_4disp($col['str_value']);
if($bookmark_id == 61797 && $key == 'title'){
	echo '<br />'.$value;
	echo '<br />'.$col['str_value'];
}
*/
					$result_arr[$bookmark_id][$key] = $value;
					break;
				case 'photo':
				case 'thumbnail':
					$bookmark_id = (int)$col['object_id'];
					$value = (int)$col['int_value'];
					$result_arr[$bookmark_id][$key] = $value;
					$_photo[$value] = $bookmark_id;
					break;
				case 'tag':
					$bookmark_id = (int)$col['object_id'];
					$value = (int)$col['int_value'];
					$result_arr[$bookmark_id][$key1st][$key] = $value;
					$_tag[$value] = $bookmark_id;
					break;
				default:
					$value= false;
					break;
			}
		}
		$result_arr['unique_tag'] = array_keys($_tag);
		$result_arr['unique_photo'] = array_keys($_photo);
		if($this->debug){ $this->log[] = array('origin' => $origin, 'result' => $result_arr); }
		return $result_arr;
	}

	function selectBookmarkDataset($bookmarkid_arr, $req_time){
		$rst = $this->selectDatasetById('selectBookmarkDataset', $bookmarkid_arr, null, null, $req_time, null);
		return $rst;
	}

	function getTagIdByTagname($tagname_arr){
		$origin = 'getTagIdByTagname';

		$rst = $this->selectRecordIdByStrValue($origin, $tagname_arr);
//		if(!$rst){ exit('error !! LINE: '.__LINE__.' - '.$origin); }
		$result_arr = array();
		while($col = $this->fetchArray($rst)){
			$tag_id = (int)$col['object_id'];
			$tag_fullname = $col['str_value'];
			$result_arr[$tag_fullname] = $tag_id;
		}

		if($this->debug){ $this->log[] = array('origin' => $origin, 'result' => $result_arr); }
		return $result_arr;
	}

	function getTagnameByTagId($tagid_arr, $req_time){
		$origin = 'getTagnameByTagId';

		$key_eq = array('tag_fullname');
		$column_arr = array('object_id', 'str_value');
		$rst = $this->selectDatasetById($origin, $tagid_arr, $key_eq, null, $req_time, $column_arr);
//		if(!$rst){ exit('error !! LINE: '.__LINE__.' - '.$origin); }
		$result_arr = array();
		while($col = $this->fetchArray($rst)){
			$tag_id = (int)$col['object_id'];
			$tag_fullname = $col['str_value'];
			$result_arr[$tag_id] = $tag_fullname;
		}

		if($this->debug){ $this->log[] = array('origin' => $origin, 'result' => $result_arr); }
		return $result_arr;
	}

	function getThumbUrlByPhotoId($photoid_arr){
		$origin = 'getThumbUrlByPhotoId';

		$key_eq = array('url');
		$column_arr = array('object_id', 'str_value');
		$rst = $this->selectDatasetById($origin, $photoid_arr, $key_eq, null, null, $column_arr);
//		if(!$rst){ exit('error !! LINE: '.__LINE__.' - '.$origin); }
		$result_arr = array();
		while($col = $this->fetchArray($rst)){
			$photo_id = (int)$col['object_id'];
			$photo_url = $col['str_value'];
			$result_arr[$photo_id] = $photo_url;
		}

		if($this->debug){ $this->log[] = array('origin' => $origin, 'result' => $result_arr); }
		return $result_arr;
	}

	function getTagIdForBookmarklet($req_time){
		$origin = 'getTagIdForBookmarklet';

		$rst = $this->selectTagIdForBookmarklet($origin, $req_time);
		$result_arr = array();
		while($col = $this->fetchArray($rst)){
			$result_arr[] = $col['tag_id'];
		}

		if($this->debug){ $this->log[] = array('origin' => $origin, 'result' => $result_arr); }
		return $result_arr;
	}
}
?>
