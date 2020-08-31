<?php
	$directory = './models';
	$scanned_directory = array_diff(scandir($directory), array('..', '.'));
	$models_list = '';
	for ($i=2; $i < sizeof($scanned_directory)+2; $i++) { 
		$models_list = $models_list . $scanned_directory[$i] . '|';
	}
	echo $models_list;
?>