<?php
	// Only allow POST requests
	if (strtoupper($_SERVER['REQUEST_METHOD']) != 'POST') {
	  throw new Exception('Only POST requests are allowed');
	}

	$dataset_dir = htmlspecialchars($_POST['name']);
	if ($dataset_dir !== "" && strpos($dataset_dir, "\\") == false &&  strpos($dataset_dir, "/") == false &&  strpos($dataset_dir, ":") == false &&  strpos($dataset_dir, "*") == false &&  strpos($dataset_dir, "?") == false &&  strpos($dataset_dir, '"') == false &&  strpos($dataset_dir, "<") == false &&  strpos($dataset_dir, ">") == false &&  strpos($dataset_dir, "|") == false) {
		$class_dir = htmlspecialchars($_POST['dir']);

		// Count total files
		$countfiles = count($_FILES['files']['name']);

		$flagFoldersCreated = false;

		// To store uploaded files path
		$files_arr = array();

		// Loop all files
		for($index = 0;$index < $countfiles;$index++){

		   // File name
		   $filename = $_FILES['files']['name'][$index];

		   // Get extension
		   $ext = pathinfo($filename, PATHINFO_EXTENSION);

		   // Valid image extension
		   $valid_ext = array("png","jpeg","jpg", "dcm");

		   // Check extension
		   if(in_array($ext, $valid_ext)){
		   		if ($flagFoldersCreated == false) {
		   			$flagFoldersCreated = true;
		   			// Upload directory
					$upload_location = "./uploads/" . '/' . $dataset_dir . '/' . $class_dir . '/';
					mkdir("./uploads/" . '/' . $dataset_dir);
					mkdir($upload_location);
		   		}

		    	// File path
		    	$path = $upload_location.$filename;

		    	// Upload file
		    	if(move_uploaded_file($_FILES['files']['tmp_name'][$index],$path)){
		        	header("Content-Type:application/json");
					echo json_encode(
					array(
						"status"=>1,
						"message"=>"The file ". $filename. " has been uploaded."
					));
				} else {
					header("Content-Type:application/json");
					echo json_encode(
						array("status"=>0,
						"message"=>"Sorry, there was an error uploading your file."
					));
				}
			}
		}
	}
?>