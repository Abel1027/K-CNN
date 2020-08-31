<?php
	// Only allow POST requests
	if (strtoupper($_SERVER['REQUEST_METHOD']) != 'POST') {
	  throw new Exception('Only POST requests are allowed');
	}

	// Make sure Content-Type is application/json 
	$content_type = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';
	if (stripos($content_type, 'application/json') === false) {
	  throw new Exception('Content-Type must be application/json');
	}

	// Read the input stream
	$body = file_get_contents("php://input");
	 
	// Decode the JSON object
	$object = json_decode($body, true);
	 
	// Throw an exception if decoding failed
	if (!is_array($object)) {
	  throw new Exception('Failed to decode JSON object');
	}

	// The object
	$layers = urldecode($object['layers']);
	$optimizer = urldecode($object['optimizer']);
	$dataset = urldecode($object['dataset']);
	$weights_name = urldecode($object['weights_name']);

	$python = 'python';
	$pyscript = getcwd() . '/scripts/python/evaluation.py';

	$directory = './c_matrix';
	$scanned_directory = array_diff(scandir($directory), array('..', '.'));
	for ($i=2; $i < sizeof($scanned_directory)+2; $i++) { 
		unlink('./c_matrix/' . $scanned_directory[$i]);
	}

	$cmd = $python . ' "' . $pyscript . '" "' . $layers . '" "' . $optimizer . '" "' . $dataset . '" "' . $weights_name . '"';

	$output = shell_exec($cmd);
	echo $output;
	//exec($cmd, $output, $return_var);
	//print_r($output);
	//echo $return_var;

	if (file_exists('./c_matrix/report.log')) {
		$content = file_get_contents('./c_matrix/report.log');
		echo ($content);
	}
?>