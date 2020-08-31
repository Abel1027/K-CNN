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
	$paths = urldecode($object['path']);

	$paths_array = explode('|', $paths);

	for ($i=0; $i < sizeof($paths_array); $i++) { 
		if (sizeof(explode('/', $paths_array[$i])) == 3 && file_exists($paths_array[$i])) {
			unlink($paths_array[$i]);
		}
	}

	for ($i=0; $i < sizeof($paths_array); $i++) { 
		if (sizeof(explode('/', $paths_array[$i])) == 2 && file_exists($paths_array[$i])) {
			$scanned_dataset = array_diff(scandir($paths_array[$i]), array('..', '.'));
			for ($j=2; $j < sizeof($scanned_dataset)+2; $j++) { 
				unlink($paths_array[$i] . '/' . $scanned_dataset[$j]);
			}
			rmdir($paths_array[$i]);
		}
	}

	for ($i=0; $i < sizeof($paths_array); $i++) {
		$pathDir = explode('/', $paths)[0] . '/' . explode('/', $paths)[1];
		if (file_exists($pathDir)) {
			$scanned_datasets = array_diff(scandir($pathDir), array('..', '.'));
			if (sizeof($scanned_datasets) == 0) { 
				rmdir($pathDir);
			}
		}
	}
?>