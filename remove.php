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

	$upperDirs = array();
	
	foreach ($paths_array as &$path) {
		if (file_exists($path) && sizeof(explode('/', $path)) == 4) {
			// remove files
		    unlink($path);
		}
		elseif (file_exists($path) && sizeof(explode('/', $path)) == 3) {
			// remove subdatasets
			$scanned_files = array_diff(scandir($path), array('..', '.'));
			foreach ($scanned_files as &$files) {
				unlink($path . '/' . $files);
			}
			rmdir($path);
			//rmdir($path);
		}
		elseif (file_exists($path) && sizeof(explode('/', $path)) == 2) {
			// remove datasets
			$scanned_subdatasets = array_diff(scandir($path), array('..', '.'));
			foreach ($scanned_subdatasets as &$subdataset) {
				// remove subdatasets
				$scanned_files = array_diff(scandir($path . '/' . $subdataset), array('..', '.'));
				foreach ($scanned_files as &$files) {
					unlink($path . '/' . $subdataset . '/' . $files);
				}
				rmdir($path . '/' . $subdataset);
			}
			rmdir($path);
			rmdir($path);
		}
	}

	$scanned_datasets = array_diff(scandir('uploads'), array('..', '.'));
	// check no empty folders
	//print_r($scanned_datasets);
	for ($i=2; $i < sizeof($scanned_datasets)+2; $i++) {
		$scanned_subdatasets = array_diff(scandir('uploads/' . $scanned_datasets[$i]), array('..', '.'));
		if (sizeof($scanned_subdatasets) != 0) {
			for ($j=2; $j < sizeof($scanned_subdatasets)+2; $j++) {
				$scanned_files = array_diff(scandir('uploads/' . $scanned_datasets[$i] . '/' . $scanned_subdatasets[$j]), array('..', '.'));
				if (sizeof($scanned_files) == 0) {
					rmdir('uploads/' . $scanned_datasets[$i] . '/' . $scanned_subdatasets[$j]);
				}
			}
		}
		else {
			rmdir('uploads/' . $scanned_datasets[$i]);
		}
	}

	// check datasets again
	for ($i=2; $i < sizeof($scanned_datasets)+2; $i++) {
		$scanned_subdatasets = array_diff(scandir('uploads/' . $scanned_datasets[$i]), array('..', '.'));
		if (sizeof($scanned_subdatasets) == 0) {
			rmdir('uploads/' . $scanned_datasets[$i]);
		}
	}
?>