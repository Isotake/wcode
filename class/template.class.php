<?php
class Template {
	function show($tpl_file){
		$tpl = $this;
		include("{$tpl_file}");
	}
	function const($const){
		echo $const;
	}
}
?>
