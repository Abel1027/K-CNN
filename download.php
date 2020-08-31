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
    $folder_name = urldecode($object['name']);
    $folder_path = urldecode($object['path']);

    // =========== https://github.com/ttodua/useful-php-scripts ========== 
    //                                 USAGE:
    //     new GoodZipArchive('path/to/input/folder',    'path/to/output_zip_file.zip') ;
    // ======================================================================


    class GoodZipArchive extends ZipArchive 
    {
        //@author Nicolas Heimann
        public function __construct($a=false, $b=false) { $this->create_func($a, $b);  }
        
        public function create_func($input_folder=false, $output_zip_file=false)
        {
            if($input_folder !== false && $output_zip_file !== false)
            {
                $res = $this->open($output_zip_file, ZipArchive::CREATE);
                if($res === TRUE)   { $this->addDir($input_folder, basename($input_folder)); $this->close(); }
                else                { echo 'Could not create a zip archive. Contact Admin.'; }
            }
        }
        
        // Add a Dir with Files and Subdirs to the archive
        public function addDir($location, $name) {
            $this->addEmptyDir($name);
            $this->addDirDo($location, $name);
        }

        // Add Files & Dirs to archive 
        private function addDirDo($location, $name) {
            $name .= '/';         $location .= '/';
          // Read all Files in Dir
            $dir = opendir ($location);
            while ($file = readdir($dir))    {
                if ($file == '.' || $file == '..') continue;
              // Rekursiv, If dir: GoodZipArchive::addDir(), else ::File();
                $do = (filetype( $location . $file) == 'dir') ? 'addDir' : 'addFile';
                $this->$do($location . $file, $name . $file);
            }
        } 
    }

    // removing existing files in ./downloads
    $scanned_directory = array_diff(scandir('downloads'), array('..', '.'));
    for ($i=2; $i < sizeof($scanned_directory)+2 ; $i++) {
        unlink('downloads/' . $scanned_directory[$i]);
    }

    // create zip file
    $output_path = 'downloads/' . $folder_name . '.zip';
    new GoodZipArchive($folder_path, $output_path) ;

    // force php to download file
    /*if(file_exists($output_path)) {
        //header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="'.basename($output_path).'"');
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Pragma: public');
        header('Content-Length: ' . filesize($output_path));
        ob_clean();
        flush(); // Flush system output buffer
        readfile($output_path);
        die();
    } else {
        http_response_code(404);
        die();
    }*/

    $downloadLink = 'https://localhost/K-CNN/' . $output_path;
    header("Content-Type:application/json");
    echo json_encode(array("link"=>$downloadLink));
?>