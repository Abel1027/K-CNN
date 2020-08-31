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
	$model_dir = urldecode($object['model']);

	$directory = './models/' . $model_dir;
	$scanned_directory = array_diff(scandir($directory), array('..', '.'));
	$weights_list = '';
	//print_r($scanned_directory);
	for ($i=0; $i < sizeof($scanned_directory)+0; $i++) {
		if (array_key_exists($i, $scanned_directory) && strpos($scanned_directory[$i], 'kras.data') !== false) {
			$weights_list = $weights_list . $scanned_directory[$i] . '|';
		}
	}
	echo $weights_list;
?>