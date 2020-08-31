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
	$dataset_path = urldecode($object['path']);
	$new_dataset_path = urldecode($object['new_path']);
	$height = urldecode($object['height']);
	$width = urldecode($object['width']);
	$mul_factor = urldecode($object['factor']);
	$rr = urldecode($object['rr']);
	$wsr = urldecode($object['wsr']);
	$hsr = urldecode($object['hsr']);
	$zr = urldecode($object['zr']);

	$python = 'python';
	$pyscript = getcwd() . '/scripts/python/mul_factor.py';

	$cmd = $python . ' "' . $pyscript . '" "' . getcwd() . '/uploads/' . $dataset_path . '" "' . getcwd() . '/uploads/' . $new_dataset_path . '" "' . $height . '" "' . $width . '" "' . $mul_factor . '" "' . $rr . '" "' . $wsr . '" "' . $hsr . '" "' . $zr . '"';

	exec($cmd, $output, $return_var);
	print_r($output);
	echo $return_var;
?>