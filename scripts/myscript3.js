var layerInputCtMax = 0;
var remainLookingForOutput = true;
var outputText = '';
var layers = false;

$('.new-layer').hide();
$('#card-training').hide();
$('#btn-remove-layers').hide();
$('#btn-train').hide();
$('#btn-stop').hide();
$('#btn-stop').prop('disabled', true);
$('#btn-remove-model').hide();
$('#btn-info-model').hide();

function modelChanged(x) {
	if (document.getElementById(x.id).value == '') {
		$('.new-layer').hide(100);
		$('#btn-train').hide(100);
		$('#btn-stop').hide(100);
		$('#btn-remove-model').hide(100);
		$('#btn-info-model').hide(100);
	}
	if (document.getElementById(x.id).value == '0') {
		$('.new-layer').show(100);
		$('#btn-train').show(100);
		$('#btn-stop').show(100);
		$('#btn-remove-model').hide(100);
		$('#btn-info-model').show(100);
		document.getElementById('select2-search-model-container').style['color'] = 'black';
	}
	else if (document.getElementById(x.id).value == '1' || document.getElementById(x.id).value == '2' || document.getElementById(x.id).value == '3' || document.getElementById(x.id).value == '4' || document.getElementById(x.id).value == '5' || document.getElementById(x.id).value == '6') {
		$('.new-layer').hide(100);
		$('#btn-train').show(100);
		$('#btn-stop').show(100);
		$('#btn-remove-model').hide(100);
		$('#btn-info-model').show(100);
		document.getElementById('select2-search-model-container').style['color'] = 'black';
	}
	else if (document.getElementById(x.id).value.length > 0) {
		$('.new-layer').hide(100);
		$('#btn-train').show(100);
		$('#btn-stop').show(100);
		$('#btn-remove-model').show(100);
		$('#btn-info-model').show(100);
		document.getElementById('select2-search-model-container').style['color'] = 'black';
	}
}

$('#btn-training').on('click', function() {
	newDatasetCardClose();
	showDatasetCardClose();
	evaluationCardClose();
	predictionCardClose();

	var wasVisible = $("#card-training").is(":visible");
	if (wasVisible) {
		$('#card-training').slideUp(200);
		document.getElementById('btn-training').style['border-color'] = 'rgb(108, 117, 125)';
		document.getElementById('card-training').style['border-color'] = 'rgb(108, 117, 125)';					
	}
	else {
		$('#card-training').slideDown(0); 
		document.getElementById('btn-training').style['border-color'] = 'rgb(255, 255, 255)';
		document.getElementById('card-training').style['border-color'] = 'rgb(255, 255, 255)';
	}
})

function trainingCardClose() {
	var wasVisible = $("#card-training").is(":visible");
	if (wasVisible) {
		$('#card-training').slideUp(0);
		document.getElementById('btn-training').style['border-color'] = 'rgb(108, 117, 125)';
		document.getElementById('card-training').style['border-color'] = 'rgb(108, 117, 125)';					
	}
}

$('#btn-clear').on('click', function() {
	document.getElementById('console').value = '';

	fetch('clear.php').then(function(response) {
		if(response.ok) {
		} else {
		}
	})
	.catch(function(error) {
	});
})

window.onload = function() {
    document.getElementById('console').value = '';

	fetch('clear.php').then(function(response) {
		if(response.ok) {
		} else {
		}
	})
	.catch(function(error) {
	});

	fetch('saved_models_list.php').then(function(response) {
		if(response.ok) {
			response.text().then(function (text) {
			  	var savedModels = text.split('|');
			  	for (var i = 0; i < savedModels.length; i++) {
			  		$('#search-model').append('<option id="' + savedModels[i] + '" value="' + savedModels[i] + '">' + savedModels[i] + '</option>');
			  	}
			});
		} else {
		}
	})
	.catch(function(error) {
	});

	fetch('trained_model_dirs.php').then(function(response) {
		if(response.ok) {
			response.text().then(function (text) {
			  	var savedModelDirs = text.split('|');
			  	for (var i = 0; i < savedModelDirs.length-1; i++) {
			  		$('#search-model-dir').append('<option id="' + savedModelDirs[i] + '" value="' + savedModelDirs[i] + '">' + savedModelDirs[i] + '</option>');
			  		$('#search-model-dir-pred').append('<option id="' + savedModelDirs[i] + '" value="' + savedModelDirs[i] + '">' + savedModelDirs[i] + '</option>');
			  	}
			});
		} else {
		}
	})
	.catch(function(error) {
	});
}

$('#btn-stop').on('click', function() {
	fetch('stop.php').then(function(response) {
		if(response.ok) {
			$('#btn-stop').prop('disabled', true);
			$('#btn-train').prop('disabled', false);
		} else {
			remainLookingForOutput = false;
			swal({
			    type: 'error',
			    title: 'Oops!',
			    text: 'Server error stopping training'
			});
		}
	})
	.catch(function(error) {
		remainLookingForOutput = false;
		swal({
			    type: 'error',
			    title: 'Oops!',
			    text: 'Network error'
			});
	});
})

var axis_value = 3;
var axis_min_value = -4;
var axis_max_value = 4;
var filter_value = 1;
var filter_min_value = 1;
var filter_max_value = 1000;
var rate_value = 0;
var rate_min_value = 0;
var rate_max_value = 1;
var seed_value = 'None';
var seed_min_value = 0;
var seed_max_value = 1000;


$('#btn-new-layer').on('click', function() {
	if (document.getElementById('search-layer').value != '') {
		var layerInputCt = 0;

		while ($("#card-layers-" + layerInputCt).length) {
			layerInputCt += 1;
		}

		if (layerInputCt > layerInputCtMax) {layerInputCtMax=layerInputCt;}

		if (document.getElementById('search-layer').value == '1') {
			$('.new-layer').append('\
			<div id="card-layers-' + layerInputCt + '" class="card card-layers">\
				<div class="input-group">\
			    	<div class="custom-file" style="margin-top:6px;margin-bottom:-4px;">\
			    		<button class="btn btn-outline-success move-up" type="button" data-toggle="tooltip" data-placement="right" title="Move up" style="margin-top:-10px;"><i class="fas fa-arrow-up"></i></button>\
			    		<button class="btn btn-outline-success move-down" type="button" data-toggle="tooltip" data-placement="right" title="Move down" style="margin-top:-10px;"><i class="fas fa-arrow-down"></i></button>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;background-color:rgb(52, 58, 64);color:white;width:100%;">Activation</span>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;width:100%;">Activation function:</span>\
			    		<select class="layer-search-box" id="search-activation-' + layerInputCt + '" data-toggle="tooltip" data-placement="right" title="Select an activation function" style="width:100%;">\
				  			<option value="">Select activation function </option>\
				  			<option value="1">ELU</option>\
				  			<option value="2">Exponential</option>\
				  			<option value="3">ReLU</option>\
				  			<option value="4">SeLU</option>\
				  			<option value="5">Sigmoid</option>\
				  			<option value="6">Softmax</option>\
				  			<option value="7">Softplus</option>\
				  			<option value="8">Softsign</option>\
				  			<option value="9">TanH</option>\
						</select>\
					</div>\
				</div>\
				<div class="input-group">\
			    	<div class="custom-file" style="margin-top:6px;margin-bottom:-4px;">\
					    <span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;width:100%;">Layer name:</span>\
					    <input type="text" id="form-control-' + layerInputCt + '" class="form-control" aria-describedby="basic-addon-' + layerInputCt + '" required" style="margin-top:-10px;width:100%;">\
						<button class="btn btn-outline-danger" type="button" data-toggle="tooltip" data-placement="right" title="Remove this layer" style="margin-top:-10px;"><i class="fas fa-trash"></i></button>\
					</div>\
			  	</div>\
			</div>');

			$('#search-activation-' + layerInputCt).select2( {
			 placeholder: "Select activation function ",
			 allowClear: true
			 });
		}
		else if (document.getElementById('search-layer').value == '2') {
			$('.new-layer').append('\
			<div id="card-layers-' + layerInputCt + '" class="card card-layers">\
				<div class="input-group">\
			    	<div class="custom-file" style="margin-top:6px;margin-bottom:-4px;">\
			    		<button class="btn btn-outline-success move-up" type="button" data-toggle="tooltip" data-placement="right" title="Move up" style="margin-top:-10px;"><i class="fas fa-arrow-up"></i></button>\
			    		<button class="btn btn-outline-success move-down" type="button" data-toggle="tooltip" data-placement="right" title="Move down" style="margin-top:-10px;"><i class="fas fa-arrow-down"></i></button>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;background-color:rgb(52, 58, 64);color:white;width:100%;">BatchNormalization</span>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;width:100%;">Axis:</span>\
			    		<input class="spinbox" id="spinbox-bn-axis-' + layerInputCt + '" type="number" onchange="axisChanged(this)" value="' + axis_value + '" min="' + axis_min_value + '" max="' + axis_max_value + '" step="1" style="height:40px;border-radius:5px;margin-top:-10px;border-color:black;width:100%;"/>\
				    	<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;width:100%;">Layer name:</span>\
				    	<input type="text" id="form-control-' + layerInputCt + '" class="form-control" aria-describedby="basic-addon-' + layerInputCt + '" required" style="margin-top:-10px;width:100%;">\
						<button class="btn btn-outline-danger" type="button" data-toggle="tooltip" data-placement="right" title="Remove this layer" style="margin-top:-10px;"><i class="fas fa-trash"></i></button>\
					</div>\
			  	</div>\
			</div>');
		}
		else if (document.getElementById('search-layer').value == '3') {
			$('.new-layer').append('\
			<div id="card-layers-' + layerInputCt + '" class="card card-layers">\
				<div class="input-group">\
			    	<div class="custom-file" style="margin-top:6px;margin-bottom:-4px;">\
			    		<button class="btn btn-outline-success move-up" type="button" data-toggle="tooltip" data-placement="right" title="Move up" style="margin-top:-10px;"><i class="fas fa-arrow-up"></i></button>\
			    		<button class="btn btn-outline-success move-down" type="button" data-toggle="tooltip" data-placement="right" title="Move down" style="margin-top:-10px;"><i class="fas fa-arrow-down"></i></button>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;background-color:rgb(52, 58, 64);color:white;width:100%;">Conv2D</span>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;width:100%;">Activation function:</span>\
			    		<select class="layer-search-box" id="search-conv2d-activation-' + layerInputCt + '" data-toggle="tooltip" data-placement="right" title="Select an activation function" style="width:100%;">\
				  			<option value="">Select activation function </option>\
				  			<option value="1">ELU</option>\
				  			<option value="2">Exponential</option>\
				  			<option value="3">ReLU</option>\
				  			<option value="4">SeLU</option>\
				  			<option value="5">Sigmoid</option>\
				  			<option value="6">Softmax</option>\
				  			<option value="7">Softplus</option>\
				  			<option value="8">Softsign</option>\
				  			<option value="9">TanH</option>\
						</select>\
						<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;margin-left:1px;width:100%;">Filters:</span>\
			    		<input class="spinbox" id="spinbox-filter-' + layerInputCt + '" type="number" onchange="filterChanged(this)" value="' + filter_value + '" min="' + filter_min_value + '" max="' + filter_max_value + '" step="1" style="height:40px;border-radius:5px;margin-top:-10px;border-color:black;width:100%;"/>\
					</div>\
				</div>\
				<div class="input-group">\
					<div class="custom-file" style="margin-top:6px;margin-bottom:-4px;">\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;">Kernel<i class="fa fa-arrows-v" aria-hidden="true" style="margin-left:3px;font-size:21px;width:100%;"></i>:</span>\
			    		<input class="spinbox" id="spinbox-kernel-height-' + layerInputCt + '" type="number" onchange="filterChanged(this)" value="' + filter_value + '" min="' + filter_min_value + '" max="' + filter_max_value + '" step="1" style="height:40px;border-radius:5px;margin-top:-10px;border-color:black;width:100%;"/>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;">Kernel<i class="fa fa-arrows-h" aria-hidden="true" style="margin-left:3px;font-size:21px;width:100%;"></i>:</span>\
			    		<input class="spinbox" id="spinbox-kernel-width-' + layerInputCt + '" type="number" onchange="filterChanged(this)" value="' + filter_value + '" min="' + filter_min_value + '" max="' + filter_max_value + '" step="1" style="height:40px;border-radius:5px;margin-top:-10px;border-color:black;width:100%;"/>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;">Stride<i class="fa fa-arrows-v" aria-hidden="true" style="margin-left:3px;font-size:21px;width:100%;"></i>:</span>\
			    		<input class="spinbox" id="spinbox-stride-height' + layerInputCt + '" type="number" onchange="filterChanged(this)" value="' + filter_value + '" min="' + filter_min_value + '" max="' + filter_max_value + '" step="1" style="height:40px;border-radius:5px;margin-top:-10px;border-color:black;width:100%;"/>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;">Stride<i class="fa fa-arrows-h" aria-hidden="true" style="margin-left:3px;font-size:21px;width:100%;"></i>:</span>\
			    		<input class="spinbox" id="spinbox-stride-width-' + layerInputCt + '" type="number" onchange="filterChanged(this)" value="' + filter_value + '" min="' + filter_min_value + '" max="' + filter_max_value + '" step="1" style="height:40px;border-radius:5px;margin-top:-10px;border-color:black;width:100%;"/>\
					</div>\
			  	</div>\
			  	<div class="input-group">\
					<div class="custom-file" style="margin-top:6px;margin-bottom:-4px;">\
			  			<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;width:100%;">Padding:</span>\
			    		<select class="layer-search-box" id="search-conv2d-padding-' + layerInputCt + '" data-toggle="tooltip" data-placement="right" title="Select padding type" style="width:100%;">\
				  			<option value="">Select padding type </option>\
				  			<option value="1">Same</option>\
				  			<option value="2">Valid</option>\
						</select>\
					    <span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;width:100%;">Layer name:</span>\
					    <input type="text" id="form-control-' + layerInputCt + '" class="form-control" aria-describedby="basic-addon-' + layerInputCt + '" required" style="margin-top:-10px;width:100%;">\
						<button class="btn btn-outline-danger" type="button" data-toggle="tooltip" data-placement="right" title="Remove this layer" style="margin-top:-10px;"><i class="fas fa-trash"></i></button>\
					</div>\
			  	</div>\
			</div>');

			$('#search-conv2d-activation-' + layerInputCt).select2( {
			 placeholder: "Select activation function ",
			 allowClear: true
			 });

			$('#search-conv2d-padding-' + layerInputCt).select2( {
			 placeholder: "Select padding type ",
			 allowClear: true
			 });
		}
		else if (document.getElementById('search-layer').value == '4') {
			$('.new-layer').append('\
			<div id="card-layers-' + layerInputCt + '" class="card card-layers">\
				<div class="input-group">\
			    	<div class="custom-file" style="margin-top:6px;margin-bottom:-4px;">\
			    		<button class="btn btn-outline-success move-up" type="button" data-toggle="tooltip" data-placement="right" title="Move up" style="margin-top:-10px;"><i class="fas fa-arrow-up"></i></button>\
			    		<button class="btn btn-outline-success move-down" type="button" data-toggle="tooltip" data-placement="right" title="Move down" style="margin-top:-10px;"><i class="fas fa-arrow-down"></i></button>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;background-color:rgb(52, 58, 64);color:white;width:100%;">Dense</span>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;width:100%;">Activation function:</span>\
			    		<select class="layer-search-box" id="search-activation-' + layerInputCt + '" data-toggle="tooltip" data-placement="right" title="Select an activation function" style="width:100%;">\
				  			<option value="">Select activation function </option>\
				  			<option value="1">ELU</option>\
				  			<option value="2">Exponential</option>\
				  			<option value="3">ReLU</option>\
				  			<option value="4">SeLU</option>\
				  			<option value="5">Sigmoid</option>\
				  			<option value="6">Softmax</option>\
				  			<option value="7">Softplus</option>\
				  			<option value="8">Softsign</option>\
				  			<option value="9">TanH</option>\
						</select>\
						<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;">Units:</span>\
			    		<input class="spinbox" id="spinbox-kernel-height-' + layerInputCt + '" type="number" onchange="filterChanged(this)" value="' + filter_value + '" min="' + filter_min_value + '" max="' + filter_max_value + '" step="1" style="height:40px;border-radius:5px;margin-top:-10px;border-color:black;width:100%;"/>\
			    	</div>\
				</div>\
				<div class="input-group">\
			    	<div class="custom-file" style="margin-top:6px;margin-bottom:-4px;">\
			        	<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;width:100%;">Layer name:</span>\
					    <input type="text" id="form-control-' + layerInputCt + '" class="form-control" aria-describedby="basic-addon-' + layerInputCt + '" required" style="margin-top:-10px;width:100%;">\
						<button class="btn btn-outline-danger" type="button" data-toggle="tooltip" data-placement="right" title="Remove this layer" style="margin-top:-10px;"><i class="fas fa-trash"></i></button>\
					</div>\
			  	</div>\
			</div>');

			$('#search-activation-' + layerInputCt).select2( {
			 placeholder: "Select activation function ",
			 allowClear: true
			 });
		}
		else if (document.getElementById('search-layer').value == '5') {
			$('.new-layer').append('\
			<div id="card-layers-' + layerInputCt + '" class="card card-layers">\
				<div class="input-group">\
			    	<div class="custom-file" style="margin-top:6px;margin-bottom:-4px;">\
			    		<button class="btn btn-outline-success move-up" type="button" data-toggle="tooltip" data-placement="right" title="Move up" style="margin-top:-10px;"><i class="fas fa-arrow-up"></i></button>\
			    		<button class="btn btn-outline-success move-down" type="button" data-toggle="tooltip" data-placement="right" title="Move down" style="margin-top:-10px;"><i class="fas fa-arrow-down"></i></button>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;background-color:rgb(52, 58, 64);color:white;width:100%;">Dropout</span>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;width:100%;">Rate:</span>\
			    		<input class="spinbox" id="spinbox-rate-' + layerInputCt + '" type="number" onchange="rateChanged(this)" value="' + rate_value + '" data-decimals="2" min="' + rate_min_value + '" max="' + rate_max_value + '" step="0.01" style="height:40px;border-radius:5px;margin-top:-10px;border-color:black;width:100%;"/>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;width:100%;">Seed:</span>\
			    		<input class="spinbox" id="spinbox-seed-' + layerInputCt + '" type="number" onchange="seedChanged(this)" value="' + seed_value + '" min="' + seed_min_value + '" max="' + seed_max_value + '" step="1" style="height:40px;border-radius:5px;margin-top:-10px;border-color:black;width:100%;"/>\
					</div>\
				</div>\
				<div class="input-group">\
			    	<div class="custom-file" style="margin-top:6px;margin-bottom:-4px;">\
					    <span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;width:100%;">Layer name:</span>\
					    <input type="text" id="form-control-' + layerInputCt + '" class="form-control" aria-describedby="basic-addon-' + layerInputCt + '" required" style="margin-top:-10px;width:100%;">\
						<button class="btn btn-outline-danger" type="button" data-toggle="tooltip" data-placement="right" title="Remove this layer" style="margin-top:-10px;"><i class="fas fa-trash"></i></button>\
					</div>\
			  	</div>\
			</div>');

			$('#search-activation-' + layerInputCt).select2( {
			 placeholder: "Select activation function ",
			 allowClear: true
			 });
		}
		else if (document.getElementById('search-layer').value == '6') {
			$('.new-layer').append('\
			<div id="card-layers-' + layerInputCt + '" class="card card-layers">\
				<div class="input-group">\
			    	<div class="custom-file" style="margin-top:6px;margin-bottom:-4px;">\
			    		<button class="btn btn-outline-success move-up" type="button" data-toggle="tooltip" data-placement="right" title="Move up" style="margin-top:-10px;"><i class="fas fa-arrow-up"></i></button>\
			    		<button class="btn btn-outline-success move-down" type="button" data-toggle="tooltip" data-placement="right" title="Move down" style="margin-top:-10px;"><i class="fas fa-arrow-down"></i></button>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;background-color:rgb(52, 58, 64);color:white;width:100%;">Fire function</span>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;width:100%;">Activation function:</span>\
			    		<select class="layer-search-box" id="search-conv2d-activation-' + layerInputCt + '" data-toggle="tooltip" data-placement="right" title="Select an activation function" style="width:100%;">\
				  			<option value="">Select activation function </option>\
				  			<option value="1">ELU</option>\
				  			<option value="2">Exponential</option>\
				  			<option value="3">ReLU</option>\
				  			<option value="4">SeLU</option>\
				  			<option value="5">Sigmoid</option>\
				  			<option value="6">Softmax</option>\
				  			<option value="7">Softplus</option>\
				  			<option value="8">Softsign</option>\
				  			<option value="9">TanH</option>\
						</select>\
					</div>\
				</div>\
				<div class="input-group">\
			    	<div class="custom-file" style="margin-top:6px;margin-bottom:-4px;">\
						<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;margin-left:1px;width:100%;">Filters (squeezed):</span>\
			    		<input class="spinbox" id="spinbox-filter-squeeze-' + layerInputCt + '" type="number" onchange="squeezeChanged(this)" value="' + filter_value + '" min="' + filter_min_value + '" max="' + filter_max_value + '" step="1" style="height:40px;border-radius:5px;margin-top:-10px;border-color:black;width:100%;"/>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;margin-left:1px;width:100%;">Filters (expanded):</span>\
			    		<input class="spinbox" id="spinbox-filter-expand-' + layerInputCt + '" type="number" onchange="squeezeChanged(this)" value="' + filter_value + '" min="' + filter_min_value + '" max="' + filter_max_value + '" step="1" style="height:40px;border-radius:5px;margin-top:-10px;border-color:black;width:100%;"/>\
					</div>\
				</div>\
				<div class="input-group">\
					<div class="custom-file" style="margin-top:6px;margin-bottom:-4px;">\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;">Kernel<i class="fa fa-arrows-v" aria-hidden="true" style="margin-left:3px;font-size:21px;width:100%;"></i>:</span>\
			    		<input class="spinbox" id="spinbox-kernel-height-' + layerInputCt + '" type="number" onchange="filterChanged(this)" value="' + filter_value + '" min="' + filter_min_value + '" max="' + filter_max_value + '" step="1" style="height:40px;border-radius:5px;margin-top:-10px;border-color:black;width:100%;"/>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;">Kernel<i class="fa fa-arrows-h" aria-hidden="true" style="margin-left:3px;font-size:21px;width:100%;"></i>:</span>\
			    		<input class="spinbox" id="spinbox-kernel-width-' + layerInputCt + '" type="number" onchange="filterChanged(this)" value="' + filter_value + '" min="' + filter_min_value + '" max="' + filter_max_value + '" step="1" style="height:40px;border-radius:5px;margin-top:-10px;border-color:black;width:100%;"/>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;">Stride<i class="fa fa-arrows-v" aria-hidden="true" style="margin-left:3px;font-size:21px;width:100%;"></i>:</span>\
			    		<input class="spinbox" id="spinbox-stride-height' + layerInputCt + '" type="number" onchange="filterChanged(this)" value="' + filter_value + '" min="' + filter_min_value + '" max="' + filter_max_value + '" step="1" style="height:40px;border-radius:5px;margin-top:-10px;border-color:black;width:100%;"/>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;">Stride<i class="fa fa-arrows-h" aria-hidden="true" style="margin-left:3px;font-size:21px;width:100%;"></i>:</span>\
			    		<input class="spinbox" id="spinbox-stride-width-' + layerInputCt + '" type="number" onchange="filterChanged(this)" value="' + filter_value + '" min="' + filter_min_value + '" max="' + filter_max_value + '" step="1" style="height:40px;border-radius:5px;margin-top:-10px;border-color:black;width:100%;"/>\
					</div>\
			  	</div>\
			  	<div class="input-group">\
					<div class="custom-file" style="margin-top:6px;margin-bottom:-4px;">\
			  			<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;width:100%;">Padding:</span>\
			    		<select class="layer-search-box" id="search-conv2d-padding-' + layerInputCt + '" data-toggle="tooltip" data-placement="right" title="Select padding type" style="width:100%;">\
				  			<option value="">Select padding type </option>\
				  			<option value="1">Same</option>\
				  			<option value="2">Valid</option>\
						</select>\
					    <span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;width:100%;">Layer name:</span>\
					    <input type="text" id="form-control-' + layerInputCt + '" class="form-control" aria-describedby="basic-addon-' + layerInputCt + '" required" style="margin-top:-10px;width:100%;">\
						<button class="btn btn-outline-danger" type="button" data-toggle="tooltip" data-placement="right" title="Remove this layer" style="margin-top:-10px;"><i class="fas fa-trash"></i></button>\
					</div>\
			  	</div>\
			</div>');

			$('#search-conv2d-activation-' + layerInputCt).select2( {
			 placeholder: "Select activation function ",
			 allowClear: true
			 });

			$('#search-conv2d-padding-' + layerInputCt).select2( {
			 placeholder: "Select padding type ",
			 allowClear: true
			 });
		}
		else if (document.getElementById('search-layer').value == '7') {
			$('.new-layer').append('\
			<div id="card-layers-' + layerInputCt + '" class="card card-layers">\
				<div class="input-group">\
			    	<div class="custom-file" style="margin-top:6px;margin-bottom:-4px;">\
			    		<button class="btn btn-outline-success move-up" type="button" data-toggle="tooltip" data-placement="right" title="Move up" style="margin-top:-10px;"><i class="fas fa-arrow-up"></i></button>\
			    		<button class="btn btn-outline-success move-down" type="button" data-toggle="tooltip" data-placement="right" title="Move down" style="margin-top:-10px;"><i class="fas fa-arrow-down"></i></button>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;background-color:rgb(52, 58, 64);color:white;width:100%;">Flatten</span>\
					    <span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;width:100%;">Layer name:</span>\
					    <input type="text" id="form-control-' + layerInputCt + '" class="form-control" aria-describedby="basic-addon-' + layerInputCt + '" required" style="margin-top:-10px;width:100%;">\
						<button class="btn btn-outline-danger" type="button" data-toggle="tooltip" data-placement="right" title="Remove this layer" style="margin-top:-10px;"><i class="fas fa-trash"></i></button>\
					</div>\
			  	</div>\
			</div>');

			$('#search-activation-' + layerInputCt).select2( {
			 placeholder: "Select activation function ",
			 allowClear: true
			 });
		}
		else if (document.getElementById('search-layer').value == '8') {
			$('.new-layer').append('\
			<div id="card-layers-' + layerInputCt + '" class="card card-layers">\
				<div class="input-group">\
			    	<div class="custom-file" style="margin-top:6px;margin-bottom:-4px;">\
			    		<button class="btn btn-outline-success move-up" type="button" data-toggle="tooltip" data-placement="right" title="Move up" style="margin-top:-10px;"><i class="fas fa-arrow-up"></i></button>\
			    		<button class="btn btn-outline-success move-down" type="button" data-toggle="tooltip" data-placement="right" title="Move down" style="margin-top:-10px;"><i class="fas fa-arrow-down"></i></button>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;background-color:rgb(52, 58, 64);color:white;width:100%;">GlobalAveragePooling2D</span>\
					    <span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;width:100%;">Layer name:</span>\
					    <input type="text" id="form-control-' + layerInputCt + '" class="form-control" aria-describedby="basic-addon-' + layerInputCt + '" required" style="margin-top:-10px;width:100%;">\
						<button class="btn btn-outline-danger" type="button" data-toggle="tooltip" data-placement="right" title="Remove this layer" style="margin-top:-10px;"><i class="fas fa-trash"></i></button>\
					</div>\
			  	</div>\
			</div>');

			$('#search-activation-' + layerInputCt).select2( {
			 placeholder: "Select activation function ",
			 allowClear: true
			 });
		}
		else if (document.getElementById('search-layer').value == '9') {
			$('.new-layer').append('\
			<div id="card-layers-' + layerInputCt + '" class="card card-layers">\
				<div class="input-group">\
			    	<div class="custom-file" style="margin-top:6px;margin-bottom:-4px;">\
			    		<button class="btn btn-outline-success move-up" type="button" data-toggle="tooltip" data-placement="right" title="Move up" style="margin-top:-10px;"><i class="fas fa-arrow-up"></i></button>\
			    		<button class="btn btn-outline-success move-down" type="button" data-toggle="tooltip" data-placement="right" title="Move down" style="margin-top:-10px;"><i class="fas fa-arrow-down"></i></button>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;background-color:rgb(52, 58, 64);color:white;width:100%;">MaxPool2D</span>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;">Pool size<i class="fa fa-arrows-v" aria-hidden="true" style="margin-left:3px;font-size:21px;width:100%;"></i>:</span>\
			    		<input class="spinbox" id="spinbox-pool-height-' + layerInputCt + '" type="number" onchange="filterChanged(this)" value="' + filter_value + '" min="' + filter_min_value + '" max="' + filter_max_value + '" step="1" style="height:40px;border-radius:5px;margin-top:-10px;border-color:black;width:100%;"/>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;">Pool size<i class="fa fa-arrows-h" aria-hidden="true" style="margin-left:3px;font-size:21px;width:100%;"></i>:</span>\
			    		<input class="spinbox" id="spinbox-pool-width-' + layerInputCt + '" type="number" onchange="filterChanged(this)" value="' + filter_value + '" min="' + filter_min_value + '" max="' + filter_max_value + '" step="1" style="height:40px;border-radius:5px;margin-top:-10px;border-color:black;width:100%;"/>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;">Stride<i class="fa fa-arrows-v" aria-hidden="true" style="margin-left:3px;font-size:21px;width:100%;"></i>:</span>\
			    		<input class="spinbox" id="spinbox-stride-height' + layerInputCt + '" type="number" onchange="filterChanged(this)" value="' + filter_value + '" min="' + filter_min_value + '" max="' + filter_max_value + '" step="1" style="height:40px;border-radius:5px;margin-top:-10px;border-color:black;width:100%;"/>\
			    		<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;">Stride<i class="fa fa-arrows-h" aria-hidden="true" style="margin-left:3px;font-size:21px;width:100%;"></i>:</span>\
			    		<input class="spinbox" id="spinbox-stride-width-' + layerInputCt + '" type="number" onchange="filterChanged(this)" value="' + filter_value + '" min="' + filter_min_value + '" max="' + filter_max_value + '" step="1" style="height:40px;border-radius:5px;margin-top:-10px;border-color:black;width:100%;"/>\
					</div>\
			  	</div>\
			  	<div class="input-group">\
					<div class="custom-file" style="margin-top:6px;margin-bottom:-4px;">\
			  			<span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;width:100%;">Padding:</span>\
			    		<select class="layer-search-box" id="search-conv2d-padding-' + layerInputCt + '" data-toggle="tooltip" data-placement="right" title="Select padding type" style="width:100%;">\
				  			<option value="">Select padding type </option>\
				  			<option value="1">Same</option>\
				  			<option value="2">Valid</option>\
						</select>\
					    <span class="input-group-text" id="basic-addon-' + layerInputCt + '" style="margin-top:-10px;width:100%;">Layer name:</span>\
					    <input type="text" id="form-control-' + layerInputCt + '" class="form-control" aria-describedby="basic-addon-' + layerInputCt + '" required" style="margin-top:-10px;width:100%;">\
						<button class="btn btn-outline-danger" type="button" data-toggle="tooltip" data-placement="right" title="Remove this layer" style="margin-top:-10px;"><i class="fas fa-trash"></i></button>\
					</div>\
			  	</div>\
			</div>');

			$('#search-conv2d-activation-' + layerInputCt).select2( {
			 placeholder: "Select activation function ",
			 allowClear: true
			 });

			$('#search-conv2d-padding-' + layerInputCt).select2( {
			 placeholder: "Select padding type ",
			 allowClear: true
			 });
		}

		$('#btn-remove-layers').show(100);
		$('#btn-train').show(100);
		$('#btn-stop').show(100);
	}
})

$('#btn-remove-layers').on('click', function() {
	for (var i = 0; i <= layerInputCtMax; i++) {
		$('#card-layers-' + i).remove();
	}
	layerInputCtMax = 0;
	$('#btn-remove-layers').hide(100);
})

function axisChanged(x) {
	if (document.getElementById(x.id).value != null) {
		if (document.getElementById(x.id).value < axis_min_value) {
			document.getElementById(x.id).value = axis_min_value;
		}
		else if (document.getElementById(x.id).value > axis_max_value) {
			document.getElementById(x.id).value = axis_max_value;
		}
	}
	else if (document.getElementById(x.id).value == null) {
		document.getElementById(x.id).value = axis_value;
	}
}

function filterChanged(x) {
	if (document.getElementById(x.id).value != null) {
		if (document.getElementById(x.id).value < filter_min_value) {
			document.getElementById(x.id).value = filter_min_value;
		}
		else if (document.getElementById(x.id).value > filter_max_value) {
			document.getElementById(x.id).value = filter_max_value;
		}
	}
	else if (document.getElementById(x.id).value == null) {
		document.getElementById(x.id).value = filter_value;
	}
}

function rateChanged(x) {
	if (document.getElementById(x.id).value != null) {
		if (document.getElementById(x.id).value < rate_min_value) {
			document.getElementById(x.id).value = rate_min_value;
		}
		else if (document.getElementById(x.id).value > rate_max_value) {
			document.getElementById(x.id).value = rate_max_value;
		}
	}
	else if (document.getElementById(x.id).value == null) {
		document.getElementById(x.id).value = rate_value;
	}
}

function seedChanged(x) {
	if (document.getElementById(x.id).value != null) {
		if (document.getElementById(x.id).value < seed_min_value) {
			document.getElementById(x.id).value = seed_min_value;
		}
		else if (document.getElementById(x.id).value > seed_max_value) {
			document.getElementById(x.id).value = seed_max_value;
		}
	}
	else if (document.getElementById(x.id).value == null) {
		document.getElementById(x.id).value = seed_value;
	}
}

function squeezeChanged(x) {
	if (document.getElementById(x.id).value != null) {
		if (document.getElementById(x.id).value < filter_min_value) {
			document.getElementById(x.id).value = filter_min_value;
		}
		else if (document.getElementById(x.id).value > filter_max_value) {
			document.getElementById(x.id).value = filter_max_value;
		}
	}
	else if (document.getElementById(x.id).value == null) {
		document.getElementById(x.id).value = filter_value;
	}

	var idThisNumber = x.id.split('-')[x.id.split('-').length-1];
	if (document.getElementById('spinbox-filter-squeeze-' + idThisNumber).value != null && document.getElementById('spinbox-filter-expand-' + idThisNumber).value != null && document.getElementById('spinbox-filter-squeeze-' + idThisNumber).value != '' && document.getElementById('spinbox-filter-expand-' + idThisNumber).value != '' && parseInt(document.getElementById('spinbox-filter-squeeze-' + idThisNumber).value) > parseInt(document.getElementById('spinbox-filter-expand-' + idThisNumber).value)) {
		document.getElementById('spinbox-filter-expand-' + idThisNumber).value = document.getElementById('spinbox-filter-squeeze-' + idThisNumber).value;
	}
}

$(document).on("click", ".move-up" , function(event) {
	var moveCardClassById = $(this).parent().parent().parent().attr('id');
	var innerHtmlElems = new Array();
	var lengthLayers = document.getElementsByClassName('card-layers').length;
	for (i = 0; i < lengthLayers; i++) {
		innerHtmlElems.push('#' + document.getElementsByClassName('card-layers')[i].id);
		if (document.getElementsByClassName('card-layers')[i].id == moveCardClassById) {
			var indexOfElemToMove = i;
		}
	}

	if (indexOfElemToMove != null) {
		if (indexOfElemToMove == 0) {
			var myElem = innerHtmlElems.shift();
			innerHtmlElems.push(myElem);
		}
		else {
			[innerHtmlElems[indexOfElemToMove], innerHtmlElems[indexOfElemToMove-1]] = [innerHtmlElems[indexOfElemToMove-1], innerHtmlElems[indexOfElemToMove]];
		}
	
		for (i = 0; i < innerHtmlElems.length; i++) {
			$(innerHtmlElems[i]).appendTo('.new-layer');
		}
	}
});

$(document).on("click", ".move-down" , function(event) {
	var moveCardClassById = $(this).parent().parent().parent().attr('id');
	var innerHtmlElems = new Array();
	var lengthLayers = document.getElementsByClassName('card-layers').length;
	for (i = 0; i < lengthLayers; i++) {
		innerHtmlElems.push('#' + document.getElementsByClassName('card-layers')[i].id);
		if (document.getElementsByClassName('card-layers')[i].id == moveCardClassById) {
			var indexOfElemToMove = i;
		}
	}

	if (indexOfElemToMove != null) {
		if (indexOfElemToMove == lengthLayers-1) {
			var myElem = innerHtmlElems.pop();
			innerHtmlElems.unshift(myElem);
		}
		else {
			[innerHtmlElems[indexOfElemToMove], innerHtmlElems[indexOfElemToMove+1]] = [innerHtmlElems[indexOfElemToMove+1], innerHtmlElems[indexOfElemToMove]];
		}
	
		for (i = 0; i < innerHtmlElems.length; i++) {
			$(innerHtmlElems[i]).appendTo('.new-layer');
		}
	}
});

function valueToTextInActivationFunc(value) {
	if (value == '1') {
		return 'ELU';
	}
	else if (value == '2') {
		return 'Exponential';
	}
	else if (value == '4') {
		return 'SeLU';
	}
	else if (value == '5') {
		return 'Sigmoid';
	}
	else if (value == '6') {
		return 'Softmax';
	}
	else if (value == '7') {
		return 'Softplus';
	}
	else if (value == '8') {
		return 'Softsign';
	}
	else if (value == '9') {
		return 'TanH';
	}
	else {
		return 'ReLU';
	}
}

function valueToTextInPadding(value) {
	if (value == '1') {
		return 'Same';
	}
	else {
		return 'Valid';
	}
}

function valueToTextInOptimizer(value) {
	if (value == '1') {
		return 'Adadelta';
	}
	else if (value == '2') {
		return 'Adagrad';
	}
	else if (value == '4') {
		return 'Adamax';
	}
	else if (value == '5') {
		return 'FTRL';
	}
	else if (value == '6') {
		return 'NAdam';
	}
	else if (value == '7') {
		return 'RMSprop';
	}
	else if (value == '8') {
		return 'SGD';
	}
	else {
		return 'Adam';
	}
}

function valueToTextInMonitoring(value) {
	if (value == '2') {
		return 'Training_loss';
	}
	else if (value == '3') {
		return 'Validation_accuracy';
	}
	else if (value == '4') {
		return 'Validation_loss';
	}
	else {
		return 'Training_accuracy';
	}
}

function checkModel() {
	layers = '';
	var modelNameInput = document.getElementById('form-control-my-model-name');
	if (modelNameInput.value == "" || modelNameInput.value.includes("\\") || modelNameInput.value.includes("/") || modelNameInput.value.includes(":")|| modelNameInput.value.includes("*") || modelNameInput.value.includes("?") || modelNameInput.value.includes('"') || modelNameInput.value.includes("<") || modelNameInput.value.includes(">") || modelNameInput.value.includes("|")) {
		layers = false;
		modelNameInput.style['border'] = '2px solid';
		modelNameInput.style['border-color'] = 'rgb(220, 53, 69)';
		swal({
		    type: 'error',
		    title: 'Error!',
		    text: 'The model must have a name and it cannot contain any of the following characters: \\/:*?"<>|'
		});
		return layers
	}
	else {
		var lengthLayers = document.getElementsByClassName('card-layers').length;
		for (i = 0; i < lengthLayers; i++) {
			var layerType = document.getElementsByClassName('card-layers')[i].children[0].children[0].getElementsByClassName('input-group-text')[0].innerText;
			
			if (layerType == 'Activation') {
				var activationFunc = document.getElementsByClassName('card-layers')[i].children[0].children[0].getElementsByClassName('layer-search-box')[0].value;
				activationFunc = valueToTextInActivationFunc(activationFunc);
				var layerName = document.getElementsByClassName('card-layers')[i].children[1].children[0].children[1].value;
				if (layerName == '') {layerName = 'None';}
				layers = layers + 'Activation-' + activationFunc + '-' + layerName + '--';
			}
			else if (layerType == 'BatchNormalization') {
				var axisValue = document.getElementsByClassName('card-layers')[i].children[0].children[0].getElementsByClassName('spinbox')[0].value;
				var layerName = document.getElementsByClassName('card-layers')[i].children[0].children[0].children[6].value;
				if (layerName == '') {layerName = 'None';}
				layers = layers + 'BatchNormalization-' + axisValue + '-' + layerName + '--';
			}
			else if (layerType == 'Conv2D') {
				var activationFunc = document.getElementsByClassName('card-layers')[i].children[0].children[0].getElementsByClassName('layer-search-box')[0].value;
				activationFunc = valueToTextInActivationFunc(activationFunc);
				var filtersValue = document.getElementsByClassName('card-layers')[i].children[0].children[0].getElementsByClassName('spinbox')[0].value;
				var kernelHeightValue = document.getElementsByClassName('card-layers')[i].children[1].children[0].getElementsByClassName('spinbox')[0].value;
				var kernelWidthValue = document.getElementsByClassName('card-layers')[i].children[1].children[0].getElementsByClassName('spinbox')[1].value;
				var strideHeightValue = document.getElementsByClassName('card-layers')[i].children[1].children[0].getElementsByClassName('spinbox')[2].value;
				var strideWidthValue = document.getElementsByClassName('card-layers')[i].children[1].children[0].getElementsByClassName('spinbox')[3].value;
				var paddingValue = document.getElementsByClassName('card-layers')[i].children[2].children[0].getElementsByClassName('layer-search-box')[0].value;
				paddingValue = valueToTextInPadding(paddingValue);
				var layerName = document.getElementsByClassName('card-layers')[i].children[2].children[0].children[4].value;
				if (layerName == '') {layerName = 'None';}
				layers = layers + 'Conv2D-' + activationFunc + '-' + filtersValue + '-' + kernelHeightValue + '-' + kernelWidthValue + '-' + strideHeightValue + '-' + strideWidthValue + '-' + paddingValue + '-' + layerName + '--';
			}
			else if (layerType == 'Dense') {
				var activationFunc = document.getElementsByClassName('card-layers')[i].children[0].children[0].getElementsByClassName('layer-search-box')[0].value;
				activationFunc = valueToTextInActivationFunc(activationFunc);
				var unitsValue = document.getElementsByClassName('card-layers')[i].children[0].children[0].getElementsByClassName('spinbox')[0].value;
				var layerName = document.getElementsByClassName('card-layers')[i].children[1].children[0].children[1].value;
				if (layerName == '') {layerName = 'None';}
				layers = layers + 'Dense-' + activationFunc + '-' + unitsValue + '-' + layerName + '--';
			}
			else if (layerType == 'Dropout') {
				var rateValue = document.getElementsByClassName('card-layers')[i].children[0].children[0].getElementsByClassName('spinbox')[0].value;
				var seedValue = document.getElementsByClassName('card-layers')[i].children[0].children[0].getElementsByClassName('spinbox')[1].value;
				if (seedValue == '') {seedValue = 'None';}
				var layerName = document.getElementsByClassName('card-layers')[i].children[1].children[0].children[1].value;
				if (layerName == '') {layerName = 'None';}
				layers = layers + 'Dropout-' + rateValue + '-' + seedValue + '-' + layerName + '--';
			}
			else if (layerType == 'Fire function') {
				var activationFunc = document.getElementsByClassName('card-layers')[i].children[0].children[0].getElementsByClassName('layer-search-box')[0].value;
				activationFunc = valueToTextInActivationFunc(activationFunc);
				var filtersSqueezedValue = document.getElementsByClassName('card-layers')[i].children[1].children[0].getElementsByClassName('spinbox')[0].value;
				var filtersExpandedValue = document.getElementsByClassName('card-layers')[i].children[1].children[0].getElementsByClassName('spinbox')[1].value;
				var kernelHeightValue = document.getElementsByClassName('card-layers')[i].children[2].children[0].getElementsByClassName('spinbox')[0].value;
				var kernelWidthValue = document.getElementsByClassName('card-layers')[i].children[2].children[0].getElementsByClassName('spinbox')[1].value;
				var strideHeightValue = document.getElementsByClassName('card-layers')[i].children[2].children[0].getElementsByClassName('spinbox')[2].value;
				var strideWidthValue = document.getElementsByClassName('card-layers')[i].children[2].children[0].getElementsByClassName('spinbox')[3].value;
				var paddingValue = document.getElementsByClassName('card-layers')[i].children[3].children[0].getElementsByClassName('layer-search-box')[0].value;
				paddingValue = valueToTextInPadding(paddingValue);
				var layerName = document.getElementsByClassName('card-layers')[i].children[3].children[0].children[4].value;
				if (layerName == '') {layerName = 'None';}
				layers = layers + 'Fire_function-' + activationFunc + '-' + filtersSqueezedValue + '-' + filtersExpandedValue + '-' + kernelHeightValue + '-' + kernelWidthValue + '-' + strideHeightValue + '-' + strideWidthValue + '-' + paddingValue + '-' + layerName + '--';
			}
			else if (layerType == 'Flatten') {
				var layerName = document.getElementsByClassName('card-layers')[i].children[0].children[0].children[4].value;
				if (layerName == '') {layerName = 'None';}
				layers = layers + 'Flatten-' + layerName + '--';
			}
			else if (layerType == 'GlobalAveragePooling2D') {
				var layerName = document.getElementsByClassName('card-layers')[i].children[0].children[0].children[4].value;
				if (layerName == '') {layerName = 'None';}
				layers = layers + 'GlobalAveragePooling2D-' + layerName + '--';
			}
			else if (layerType == 'MaxPool2D') {
				var poolHeightValue = document.getElementsByClassName('card-layers')[i].children[0].children[0].getElementsByClassName('spinbox')[0].value;
				var poolWidthValue = document.getElementsByClassName('card-layers')[i].children[0].children[0].getElementsByClassName('spinbox')[1].value;
				var strideHeightValue = document.getElementsByClassName('card-layers')[i].children[0].children[0].getElementsByClassName('spinbox')[2].value;
				var strideWidthValue = document.getElementsByClassName('card-layers')[i].children[0].children[0].getElementsByClassName('spinbox')[3].value;
				var paddingValue = document.getElementsByClassName('card-layers')[i].children[1].children[0].getElementsByClassName('layer-search-box')[0].value;
				paddingValue = valueToTextInPadding(paddingValue);
				var layerName = document.getElementsByClassName('card-layers')[i].children[1].children[0].children[4].value;
				if (layerName == '') {layerName = 'None';}
				layers = layers + 'MaxPool2D-' + poolHeightValue + '-' + poolWidthValue + '-' + strideHeightValue + '-' + strideWidthValue + '-' + paddingValue + '-' + layerName + '--';
			}
		}
		if (layers == '') {
			layers = false;
			return layers;
		}
		layers = document.getElementById('form-control-my-model-name').value + '#' + layers;
		return layers;
	}
}

$('#btn-train').on('click', function() {
	var modelChecking = true;
	layers = getLayers(modelChecking);
})

function getLayers(modelChecking=false, datasetChecking=true) {
	layers = false;

	if (datasetChecking == false || document.getElementById('search-dataset').value != null && document.getElementById('search-dataset').value != '') {
		if (document.getElementById('search-model').value == '0') {
			layers = checkModel();
			if (modelChecking == true) {modelChecked(layers);}
		}
		else if (document.getElementById('search-model').value == '1') {
			// link: https://github.com/PAN001/All-CNN
			layers = 'All-CNN#Conv2D-ReLU-3-3-3-1-1-Same-l1--Conv2D-ReLU-96-3-3-1-1-Same-l2--Conv2D-ReLU-96-3-3-2-2-Same-l3--Dropout-0.5-None-l4--Conv2D-ReLU-192-3-3-1-1-Same-l5--Conv2D-ReLU-192-3-3-1-1-Same-l6--Conv2D-ReLU-192-3-3-2-2-Same-l7--Dropout-0.5-None-l8--Conv2D-ReLU-192-3-3-1-1-Valid-l9--Conv2D-ReLU-192-1-1-1-1-Same-l10--Conv2D-ReLU-192-1-1-1-1-Same-l11--GlobalAveragePooling2D-l12--Activation-Softmax-l13--';
			if (modelChecking == true) {modelChecked(layers);}
		}
		else if (document.getElementById('search-model').value == '2') {
			layers = 'InceptionV3#';
			if (modelChecking == true) {modelChecked(layers);}
		}
		else if (document.getElementById('search-model').value == '3') {
			// LeNet
			layers = 'LeNet#Conv2D-ReLU-64-3-3-1-1-Same-l1--MaxPool2D-3-3-2-2-Same-l2--Conv2D-ReLU-128-3-3-1-1-Same-l3--MaxPool2D-3-3-2-2-Same-l4--Dropout-0.1-None-l5--Flatten-l6--Dense-ReLU-256-l7--Dense-ReLU-256-l8--Dropout-0.5-None-l9--Dense-Softmax-2-l10--';
			if (modelChecking == true) {modelChecked(layers);}
		}
		else if (document.getElementById('search-model').value == '4') {
			layers = 'MobileNet#';
			if (modelChecking == true) {modelChecked(layers);}
		}
		else if (document.getElementById('search-model').value == '5') {
			// SqueezeNet
			layers = 'SqueezeNet#Conv2D-ReLU-64-3-3-2-2-Valid-l1--MaxPool2D-3-3-2-2-Same-l2--Dropout-0.1-None-l3--Fire_function-ReLU-16-64-1-1-1-1-Valid-l4--Fire_function-ReLU-16-64-1-1-1-1-Valid-l5--MaxPool2D-3-3-2-2-Same-l6--Dropout-0.1-None-l7--Fire_function-ReLU-32-128-1-1-1-1-Valid-l8--Fire_function-ReLU-32-128-1-1-1-1-Valid-l9--MaxPool2D-3-3-2-2-Same-l10--Dropout-0.1-None-l11--Fire_function-ReLU-48-192-1-1-1-1-Valid-l12--Fire_function-ReLU-48-192-1-1-1-1-Valid-l13--Fire_function-ReLU-64-256-1-1-1-1-Valid-l14--Fire_function-ReLU-64-256-1-1-1-1-Valid-l15--Conv2D-ReLU-2-1-1-1-1-Valid-l16--GlobalAveragePooling2D-l17--Activation-Softmax-l18--';
			if (modelChecking == true) {modelChecked(layers);}
		}
		else if (document.getElementById('search-model').value == '6') {
			layers = 'VGG16#';
			if (modelChecking == true) {modelChecked(layers);}
		}
		else {
			// this is for all saved models
			var model_name = document.getElementById('search-model').value;
			
			var request = { 
				method: 'POST',
	            headers: {'Content-Type': 'application/json'},
	            body: JSON.stringify({
	            	'name': model_name
	            })
        	};

			fetch('get_model.php', request).then(function(response) {
				if(response.ok) {
					response.text().then(function (text) {
					  	layers = text;
					  	if (modelChecking == true) {modelChecked(layers);}
					});
				} else {
					layers = false;
					if (modelChecking == true) {modelChecked(layers);}
					swal({
					    type: 'error',
					    title: 'Oops!',
					    text: 'Error retrieving model'
					});
					return layers
				}
			})
			.catch(function(error) {
				layers = false;
				if (modelChecking == true) {modelChecked(layers);}
				swal({
					    type: 'error',
					    title: 'Oops!',
					    text: 'Network error'
					});
				return layers
			});
		}
		return layers
	}
	else {
		swal({
		    type: 'error',
		    title: 'Dataset error!',
		    text: 'Please select a valid dataset'
		});
		return layers
	}
}

function modelChecked(layers) {
	if (layers != false) {
		$('#btn-stop').prop('disabled', false);
		$('#btn-train').prop('disabled', true);

		var optimizer = document.getElementById('search-optimizer').value;
		optimizer = valueToTextInOptimizer(optimizer);
		var monitoring = document.getElementById('search-monitor').value;
		monitoring = valueToTextInMonitoring(monitoring);
		var bestModel = document.getElementById('save-best').checked;
		if (bestModel == true) {bestModel = 'Yes';} else {bestModel = 'No';}
		var lr = document.getElementById('lr').value;
		var epochs = document.getElementById('epochs').value;
		var batch = document.getElementById('batch').value;
		var validation = document.getElementById('validation').value;
		var idNumber = document.getElementById('search-dataset').value;
		var dataset = document.getElementById('my-dataset-label-' + idNumber).innerText;
		var transf = document.getElementById('transf').checked;
		if (transf == true) {transf = 'True';} else {transf = 'False';}

		//console.log(layers);
		//console.log(optimizer);

		var request = { 
			method: 'POST',
	        headers: {'Content-Type': 'application/json'},
	        body: JSON.stringify({
	        	'layers': layers,
	        	'optimizer': optimizer,
	        	'monitoring': monitoring,
	        	'bestModel': bestModel,
	        	'lr': lr,
	        	'epochs': epochs,
	        	'batch': batch,
	        	'validation': validation,
	        	'dataset': dataset,
	        	'transf': transf
	        })
		};

		remainLookingForOutput = true;
		getOutput();

		fetch('training_script.php', request).then(function(response) {
			if(response.ok) {
				response.text().then(function (text) {
					//console.log(text);
					remainLookingForOutput = false;
					//  swal({
						//     type: 'success',
						//     title: 'Done!',
						//     text: 'Training finished'
						// });	
				});			  	 
			} else {
				swal({
				    type: 'error',
				    title: 'Oops!',
				    text: 'Server error training dataset'
				});
			}
		})
		.catch(function(error) {
			swal({
				    type: 'error',
				    title: 'Oops!',
				    text: 'Network error'
				});
		});
	}
	else {
		swal({
		    type: 'error',
		    title: 'Model error!',
		    text: 'Please check all the fields and provide at least one layer'
		});
	}
}

function getOutput() {
	var startTrainingTimestamp = new Date();
	var getLogs = setInterval(function(){
		fetch('get_output.php').then(function(response) {
			if(response.ok) {
				response.text().then(function (text) {
					newOutputText = text.replace(outputText, '');
					outputText = text;
					if (newOutputText != '' && newOutputText != '\n' && newOutputText != 'no output') {
						document.getElementById('console').value = outputText;
						document.getElementById('console').focus();
						document.getElementById('console').scrollTop = document.getElementById('console').scrollHeight;
						startTrainingTimestamp = new Date();
					}
					else {
						var endTrainingTimestamp = new Date();
						if (endTrainingTimestamp - startTrainingTimestamp > 300000) {
							remainLookingForOutput = false; // stop training after 5 minutes
						}
					}
					//console.log(newOutputText);
				});			  	 
			} else {
				remainLookingForOutput = false;
				swal({
				    type: 'error',
				    title: 'Oops!',
				    text: 'Server error retrieving output'
				});
			}
		})
		.catch(function(error) {
			remainLookingForOutput = false;
			swal({
				    type: 'error',
				    title: 'Oops!',
				    text: 'Network error'
				});
		});

		if (remainLookingForOutput == false) {
			$('#btn-stop').prop('disabled', true);
			$('#btn-train').prop('disabled', false);

			$('#model-weight').hide(100);
			$('#btn-remove-model-weight').hide(100);
			$('#btn-matrix').hide(100);
			$('#btn-metrics').hide(100);

			$('#search-model-dir').empty();
			//$('#search-model-dir').append('<option value="">Select directory for evaluation </option>');

			fetch('trained_model_dirs.php').then(function(response) {
				if(response.ok) {
					response.text().then(function (text) {
					  	var savedModelDirs = text.split('|');
					  	for (var i = 0; i < savedModelDirs.length-1; i++) {
					  		$('#search-model-dir').append('<option id="' + savedModelDirs[i] + '" value="' + savedModelDirs[i] + '">' + savedModelDirs[i] + '</option>');
					  		$('#search-model-dir-pred').append('<option id="' + savedModelDirs[i] + '" value="' + savedModelDirs[i] + '">' + savedModelDirs[i] + '</option>');
					  	}
					});
				} else {
				}
			})
			.catch(function(error) {
			});

			clearInterval(getLogs);
		}
	}, 500);
}

$('#form-control-my-model-name').on('click', function() {
	document.getElementById('form-control-my-model-name').style['border'] = 'none';
});

$('#btn-upload-model').on('click', function() {
	layers = checkModel();
	var model_name = document.getElementById('form-control-my-model-name').value;
	if (layers != false) {
		var request = { 
			method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
            	'name': model_name,
            	'model': layers
            })
    	};

    	fetch('save_model.php', request).then(function(response) {
			if(response.ok) {
			  	response.text().then(function (text) {
				  	if (text.includes('yes')) {								  		
				  		swal({
						    type: 'error',
						    title: 'Oops!',
						    text: 'Model already exist'
						});
					}
				  	else {
				  		swal({
						    type: 'success',
						    title: 'Done!',
						    text: 'Model saved'
						});
						$('#search-model').append('<option id="' + model_name + '" value="' + model_name + '">' + model_name + '</option>');
				  	}
				});   
			} else {
				swal({
				    type: 'error',
				    title: 'Oops!',
				    text: 'Server error saving model'
				});
			}
		})
		.catch(function(error) {
		  swal({
			    type: 'error',
			    title: 'Oops!',
			    text: 'Network error'
			});
		});
	}
});

$('#btn-remove-model').on('click', function() {
	swal({
	title: 'Remove selected model',
	text: 'Are you sure?',
	type: 'warning',
	showCancelButton: true,
	confirmButtonColor: '#3085d6',
	cancelButtonColor: '#d33',
	confirmButtonText: 'Yes, remove it!'
	}).then((result) => {
	    if (result.value) {
	    	var model_name = document.getElementById('search-model').value;

			var request = { 
				method: 'POST',
		        headers: {'Content-Type': 'application/json'},
		        body: JSON.stringify({
		        	'name': model_name
		        })
			};

			fetch('remove_model.php', request).then(function(response) {
				if(response.ok) {
					swal({
					    type: 'success',
					    title: 'Done!',
					    text: 'Model removed'
					});
				  	document.getElementById(model_name).remove();
					document.getElementById('select2-search-model-container').innerText = 'Select model ';
					document.getElementById('select2-search-model-container').style['color'] = 'gray';
					$('.new-layer').hide(100);
					$('#btn-train').hide(100);
					$('#btn-stop').hide(100);
					$('#btn-remove-model').hide(100);
					$('#btn-info-model').hide(100);
				} else {
					swal({
					    type: 'error',
					    title: 'Oops!',
					    text: 'Error removing model'
					});
				}
			})
			.catch(function(error) {
				swal({
					    type: 'error',
					    title: 'Oops!',
					    text: 'Network error'
					});
			});
		}
	})
});

function parseLayer(layers) {
	var html = '<label>Model name:</label><label id="dataset_name">' + layers.split('#')[0] + '</label><div class="model-info">';
	var layers_list = layers.split('#')[1].split('--');
	for (var i = 0; i < layers_list.length; i++) {
		var layer = layers_list[i];
		if (layer.split('-')[0] == 'Activation') {
			var act_func = layer.split('-')[1];
			var layer_name = layer.split('-')[2];
			html = html + '<div><label>x = Activation(' + act_func + ', name=' + layer_name + ')(x)</label></div>';
		}
		else if (layer.split('-')[0] == 'BatchNormalization') {
			var axis = layer.split('-')[1];
			var layer_name = layer.split('-')[2];
			html = html + '<div><label>x = BatchNormalization(axis=' + axis + ')(x)</label></div>';
		}
		else if (layer.split('-')[0] == 'Conv2D') {
			var act_func = layer.split('-')[1];
			var filters = layer.split('-')[2];
			var kernel_height = layer.split('-')[3];
			var kernel_width = layer.split('-')[4];
			var stride_height = layer.split('-')[5];
			var stride_width = layer.split('-')[6];
			var padding = layer.split('-')[7];
			var layer_name = layer.split('-')[8];
			html = html + '<div><label>x = Conv2D(' + filters + ', (' + kernel_height + ', ' + kernel_width + '), strides=(' + stride_height + ', ' + stride_width + '), padding=' + padding + ', name=' + layer_name + ', activation=' + act_func + ')(x)</label></div>';
		}
		else if (layer.split('-')[0] == 'Dense') {
			var act_func = layer.split('-')[1];
			var units = layer.split('-')[2];
			var layer_name = layer.split('-')[3];
			html = html + '<div><label>x = Dense(' + units + ', activation=' + act_func + ', name=' + layer_name + ')(x)</label></div>';
		}
		else if (layer.split('-')[0] == 'Dropout') {
			var rate = layer.split('-')[1];
			var seed = layer.split('-')[2];
			var layer_name = layer.split('-')[3];
			if (seed != 'None') {
				html = html + '<div><label>x = Dropout(' + rate + ', seed=' + seed + ')(x)</label></div>';
			}
			else {
				html = html + '<div><label>x = Dropout(' + rate + ')(x)</label></div>';
			}
		}
		else if (layer.split('-')[0] == 'Fire_function') {
			var act_func = layer.split('-')[1];
			var filters_squeezed = layer.split('-')[2];
			var filters_expanded = layer.split('-')[3];
			var kernel_height = layer.split('-')[4];
			var kernel_width = layer.split('-')[5];
			var stride_height = layer.split('-')[6];
			var stride_width = layer.split('-')[7];
			var padding = layer.split('-')[8];
			var layer_name = layer.split('-')[9];
			html = html + '<div><label>fire_module(x, ' + layer_name + ', squeeze=' + filters_squeezed + ', expand=' + filters_expanded + ', activation=' + act_func + ', kernel_height=' + kernel_height + ', kernel_width=' + kernel_width + ', stride_height=' + stride_height + ', stride_width=' + stride_width + ', padding=' + padding + ')</label></div>';
		}
		else if (layer.split('-')[0] == 'Flatten') {
			var layer_name = layer.split('-')[1];
			html = html + '<div><label>x = Flatten()(x)</label></div>';
		}
		else if (layer.split('-')[0] == 'GlobalAveragePooling2D') {
			var layer_name = layer.split('-')[1];
			html = html + '<div><label>x = GlobalAveragePooling2D()(x)</label></div>';
		}
		else if (layer.split('-')[0] == 'MaxPool2D') {
			var pool_height = layer.split('-')[1];
			var pool_width = layer.split('-')[2];
			var stride_height = layer.split('-')[3];
			var stride_width = layer.split('-')[4];
			var padding = layer.split('-')[5];
			var layer_name = layer.split('-')[6];
			html = html + '<div><label>x = MaxPool2D(pool_size=(' + pool_height + ', ' + pool_width + '), strides=(' + stride_height + ', ' + stride_width + '), padding=' + padding + ', name=' + layer_name + ')(x)</label></div>';
		}
	}

	html = html + '</div>';

	swal({
		    title: 'Model architecture',
		    html: html
			});
}

function parseLink(name, link) {
	swal({
		    title: 'Model architecture',
		    html: '<label>Model name:</label><label id="dataset_name">' + name + '</label><p><a href="' + link + '" target="_blank" rel="noopener noreferrer">Visit ' + name + ' here</a></p>'
			});
}

$('#btn-info-model').on('click', function() {
	if (document.getElementById('search-model').value == '1') {
		// link: https://github.com/PAN001/All-CNN
		layers = 'All-CNN#Conv2D-ReLU-3-3-3-1-1-Same-l1--Conv2D-ReLU-96-3-3-1-1-Same-l2--Conv2D-ReLU-96-3-3-2-2-Same-l3--Dropout-0.5-None-l4--Conv2D-ReLU-192-3-3-1-1-Same-l5--Conv2D-ReLU-192-3-3-1-1-Same-l6--Conv2D-ReLU-192-3-3-2-2-Same-l7--Dropout-0.5-None-l8--Conv2D-ReLU-192-3-3-1-1-Valid-l9--Conv2D-ReLU-192-1-1-1-1-Same-l10--Conv2D-ReLU-192-1-1-1-1-Same-l11--GlobalAveragePooling2D-l12--Activation-Softmax-l13--';
		parseLayer(layers);
	}
	else if (document.getElementById('search-model').value == '2') {
		// https://software.intel.com/content/www/us/en/develop/articles/inception-v3-deep-convolutional-architecture-for-classifying-acute-myeloidlymphoblastic.html
		layers = 'InceptionV3#';
		parseLink('InceptionV3', 'https://software.intel.com/content/www/us/en/develop/articles/inception-v3-deep-convolutional-architecture-for-classifying-acute-myeloidlymphoblastic.html');
	}
	else if (document.getElementById('search-model').value == '3') {
		// LeNet
		layers = 'LeNet#Conv2D-ReLU-64-3-3-1-1-Same-l1--MaxPool2D-3-3-2-2-Same-l2--Conv2D-ReLU-128-3-3-1-1-Same-l3--MaxPool2D-3-3-2-2-Same-l4--Dropout-0.1-None-l5--Flatten-l6--Dense-ReLU-256-l7--Dense-ReLU-256-l8--Dropout-0.5-None-l9--Dense-Softmax-2-l10--';
		parseLayer(layers);
	}
	else if (document.getElementById('search-model').value == '4') {
		// https://towardsdatascience.com/review-mobilenetv1-depthwise-separable-convolution-light-weight-model-a382df364b69
		layers = 'MobileNet#';
		parseLink('MobileNet', 'https://towardsdatascience.com/review-mobilenetv1-depthwise-separable-convolution-light-weight-model-a382df364b69');
	}
	else if (document.getElementById('search-model').value == '5') {
		// SqueezeNet
		layers = 'SqueezeNet#Conv2D-ReLU-64-3-3-2-2-Valid-l1--MaxPool2D-3-3-2-2-Same-l2--Dropout-0.1-None-l3--Fire_function-ReLU-16-64-1-1-1-1-Valid-l4--Fire_function-ReLU-16-64-1-1-1-1-Valid-l5--MaxPool2D-3-3-2-2-Same-l6--Dropout-0.1-None-l7--Fire_function-ReLU-32-128-1-1-1-1-Valid-l8--Fire_function-ReLU-32-128-1-1-1-1-Valid-l9--MaxPool2D-3-3-2-2-Same-l10--Dropout-0.1-None-l11--Fire_function-ReLU-48-192-1-1-1-1-Valid-l12--Fire_function-ReLU-48-192-1-1-1-1-Valid-l13--Fire_function-ReLU-64-256-1-1-1-1-Valid-l14--Fire_function-ReLU-64-256-1-1-1-1-Valid-l15--Conv2D-ReLU-2-1-1-1-1-Valid-l16--GlobalAveragePooling2D-l17--Activation-Softmax-l18--';
		parseLayer(layers);
	}
	else if (document.getElementById('search-model').value == '6') {
		// https://neurohive.io/en/popular-networks/vgg16/
		layers = 'VGG16#';
		parseLink('VGG16', 'https://neurohive.io/en/popular-networks/vgg16/');
	}
	else {
		// this is for all saved models
		var model_name = document.getElementById('search-model').value;
		
		var request = { 
			method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
            	'name': model_name
            })
    	};

		fetch('get_model.php', request).then(function(response) {
			if(response.ok) {
				response.text().then(function (text) {
				  	parseLayer(text);
				});
			} else {
				swal({
				    type: 'error',
				    title: 'Oops!',
				    text: 'Error retrieving model info'
				});
			}
		})
		.catch(function(error) {
			swal({
				    type: 'error',
				    title: 'Oops!',
				    text: 'Network error'
				});
		});
	}
})