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
	$model_dirs = urldecode($object['models']);
	$model_dirs_array = explode("|", $model_dirs);

	for ($i=0; $i < sizeof($model_dirs_array)-1; $i++) {
		$scanned_directory = array_diff(scandir('./models/' . $model_dirs_array[$i]), array('..', '.'));
		for ($j=2; $j < sizeof($scanned_directory)+2; $j++) {
			unlink('./models/' . $model_dirs_array[$i] . '/' . $scanned_directory[$j]);
		}
		rmdir('./models/' . $model_dirs_array[$i]);
	}
?>