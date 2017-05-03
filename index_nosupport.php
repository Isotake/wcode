<?php
$xoopsOption['nocommon'] = 1;
require '../../mainfile.php';
include './include/common.php';

require_once XOOPS_ROOT_PATH . '/class/template.php';
$xoopsTpl = new XoopsTpl();
$xoopsTpl->assign(
	array(
//		'debug_output' => $xoopsConfig['debug_mode']
	)
) ;

$xoopsTpl->display('wcode/theme_nosupport.html');

?>
