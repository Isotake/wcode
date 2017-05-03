<?php
function is_natural($val){
	return !!(is_int($val) && $val > 0);
}

function is_natural_and_zero($val){
	return !!(is_int($val) && $val > -1);
}

function space_trim($str){
	$str = preg_replace('/^[　 ]+/u', '', $str);
	$str = preg_replace('/[　 ]+$/u', '', $str);
	return $str;
}
?>
