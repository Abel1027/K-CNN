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
	$monitoring = urldecode($object['monitoring']);
	$bestModel = urldecode($object['bestModel']);
	$lr = urldecode($object['lr']);
	$epochs = urldecode($object['epochs']);
	$batch = urldecode($object['batch']);
	$validation = urldecode($object['validation']);
	$dataset = urldecode($object['dataset']);
	$transf = urldecode($object['transf']);

	$python = 'python';
	$pyscript = getcwd() . '/scripts/python/training.py';

	$cmd = $python . ' "' . $pyscript . '" "' . $layers . '" "' . $optimizer . '" "' . $monitoring . '" "' . $bestModel . '" "' . $lr . '" "' . $epochs . '" "' . $batch . '" "' . $validation . '" "' . $dataset . '" "' . $transf . '"';
	
	$output = shell_exec($cmd);
	echo $output;
	//exec($cmd, $output, $return_var);
	//print_r($output);
	//echo $return_var;
?>