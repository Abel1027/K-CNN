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
	$path = urldecode($object['path']);

	$rii = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path));

	$files = array(); 

	foreach ($rii as $file) {

	    if ($file->isDir()){ 
	        continue;
	    }

	    $files[] = $file->getPathname(); 

	}

	header("Content-Type:application/json");
	echo json_encode($files);
?>