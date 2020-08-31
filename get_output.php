<?php
	if (file_exists('scripts/python/output/output.log')) {
	    $content = file_get_contents('scripts/python/output/output.log', true);
	    echo $content;
	}
	else {
		echo 'no output';
	}
?>