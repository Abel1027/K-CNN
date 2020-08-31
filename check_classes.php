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

	// The object
	$dataset = urldecode($object['dataset_name']);

	$directory = './uploads';
	$scanned_directory = array_diff(scandir($directory), array('..', '.'));
	if (in_array($dataset, $scanned_directory)) {
		$scanned_dataset = array_diff(scandir($directory . '/' . $dataset), array('..', '.'));
		header("Content-Type:application/json");
		echo json_encode($scanned_dataset);
	}
?>