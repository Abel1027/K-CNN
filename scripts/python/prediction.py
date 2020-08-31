import os
import sys
import cv2
import dicom
import pydicom
import PIL
import numpy as np
from keras import Input, activations
from keras.models import load_model, Model
from keras.layers import Activation, BatchNormalization, Conv2D, Dense, Dropout, Flatten, GlobalAveragePooling2D, MaxPool2D, concatenate
from keras.applications.inception_v3 import InceptionV3
from keras.applications import MobileNet
from keras.applications.vgg16 import VGG16
from training import load_img, formatKeras, parse
path = os.getcwd().replace('\\', '/')

def saveToFile(line):
	print(line)
	#file = open(path + '/output/output.log', 'a') # from cmd
	#file = open(path + '/scripts/python/output/output.log', 'a') # from php
	#file.write(line)
	#file.close()

def create_tensor(src):

	#This method creates a numpy tensor from an image.

	#Input parameters
	#src: image path.

	#Outputs:
	#imgs: numpy tensor

	#Compatible formats list of the input images.
	formats = ('dcm','jpg','jpeg','jpe','jp2','webp','pbm','pgm','ppm','sr','ras','tiff','tif','png','bmp','dib')

	if not os.path.isfile(src): raise Exception('There is not such image')
	if src.split('.')[-1] not in formats: raise Exception('Format not compatible')

	if src.split('.')[-1] == 'dcm': im = parse(src)
	else: im = cv2.imread(src, 0)
	imshape0 = im.shape[0]
	imshape1 = im.shape[1]

	#It creates a tensor that hold "num" generic images with the format specified in "format".
	img = np.zeros(shape = ((1,)+(imshape0,imshape1)), dtype = np.uint8 )

	img = load_img(src, format=(imshape0,imshape1))

	tensor_keras = formatKeras(img)

	return tensor_keras #Return image tensor.

def fire_module(x, layer_name='', squeeze=16, expand=64, activation='relu', kernel_height=1, kernel_width=1, stride_height=1, stride_width=1, padding='valid'):
	sq1x1 = "squeeze1x1"
	exp1x1 = "expand1x1"
	exp3x3 = "expand3x3"
	s_id = 'fire_' + str(layer_name) + '/'

	# x = Conv2D(squeeze, (kernel_height, kernel_width), strides=(stride_height, stride_width), padding=padding, name = s_id + sq1x1, activation=activation)(x)
	# left = Conv2D(expand, (kernel_height, kernel_width), strides=(stride_height, stride_width), padding=padding, name = s_id + exp1x1, activation=activation)(x)
	# right = Conv2D(expand, (3, 3), strides=(stride_height, stride_width), padding='same', name = s_id + exp3x3, activation=activation)(x)
	x = Conv2D(squeeze, (kernel_height, kernel_width), padding=padding, name = s_id + sq1x1, activation=activation)(x)
	left = Conv2D(expand, (kernel_height, kernel_width), padding=padding, name = s_id + exp1x1, activation=activation)(x)
	right = Conv2D(expand, (3, 3), padding='same', name = s_id + exp3x3, activation=activation)(x)
	x = concatenate([left, right], name = s_id + 'concat')
	return x

def create(layers, optimizer, img, number_of_classes=2):
	model_name = layers.split('#')[0]
	layers_list = layers.split('#')[1].split('--')

	img_path = img

	if img_path[0].split('.')[-1] == 'dcm': im = parse(img_path)
	else: im = cv2.imread(img_path, 0)
	imshape0 = im.shape[0]
	imshape1 = im.shape[1]
	input_format=(imshape0, imshape1, 1)

	inputs = Input(shape=input_format, name='Input')

	try:
		dataset = '-';
		if dataset != '':
			# checking the last layer that provides the number of classes
			last_layer_index = len(layers_list)-1
			for i in range(len(layers_list)):
				if layers_list[i].split('-')[0] == 'Conv2D' or layers_list[i].split('-')[0] == 'Dense':
					last_layer_index = i

			if model_name == 'InceptionV3':
				model = InceptionV3(weights=None, classes=number_of_classes, input_shape=input_format)
				saveToFile('Using predefined model: InceptionV3\n')
			elif model_name == 'MobileNet':
				model = MobileNet(weights=None, classes=number_of_classes, input_shape=input_format, dropout = 0.3)
				saveToFile('Using predefined model: MobileNet\n')
			elif model_name == 'VGG16':
				model = VGG16(weights=None, classes=number_of_classes, input_shape=input_format)
				saveToFile('Using predefined model: VGG16\n')
			else:
				saveToFile('Layers:\n')
				counter = 0
				for layer in layers_list:
					if layer.split('-')[0] == 'Activation':
						act_func = layer.split('-')[1].lower()
						layer_name = layer.split('-')[2].lower()
						if counter == 0:
							x = Activation(act_func, name=layer_name)(inputs)
						else:
							x = Activation(act_func, name=layer_name)(x)
						saveToFile('    x = Activation(' + act_func + ', name=' + layer_name + ')(x)\n')
					elif layer.split('-')[0] == 'BatchNormalization':
						axis = int(layer.split('-')[1])
						layer_name = layer.split('-')[2].lower()
						if counter == 0:
							x = BatchNormalization(axis=axis)(inputs)
						else:
							x = BatchNormalization(axis=axis)(x)
						saveToFile('    x = BatchNormalization(axis=' + str(axis) + ')(x)\n')
					elif layer.split('-')[0] == 'Conv2D':
						act_func = layer.split('-')[1].lower()
						filters = int(layer.split('-')[2])
						kernel_height = int(layer.split('-')[3])
						kernel_width = int(layer.split('-')[4])
						stride_height = int(layer.split('-')[5])
						stride_width = int(layer.split('-')[6])
						padding = layer.split('-')[7].lower()
						layer_name = layer.split('-')[8].lower()
						if counter == 0:
							x = Conv2D(filters, (kernel_height, kernel_width), strides=(stride_height, stride_width), padding=padding, name=layer_name, activation=act_func)(inputs)
						else:
							if counter == last_layer_index:
								filters = number_of_classes
							x = Conv2D(filters, (kernel_height, kernel_width), strides=(stride_height, stride_width), padding=padding, name=layer_name, activation=act_func)(x)
						saveToFile('    x = Conv2D(' + str(filters) + ', (' + str(kernel_height) + ', ' + str(kernel_width) + '), strides=(' + str(stride_height) + ', ' + str(stride_width) + '), padding=' + padding + ', name=' + layer_name + ', activation=' + act_func + ')(x)\n')
					elif layer.split('-')[0] == 'Dense':
						act_func = layer.split('-')[1].lower()
						units = int(layer.split('-')[2])
						layer_name = layer.split('-')[3].lower()
						if counter == 0:
							x = Dense(units, activation=act_func, name=layer_name)(inputs)
						else:
							if counter == last_layer_index:
								units = number_of_classes
							x = Dense(units, activation=act_func, name=layer_name)(x)
						saveToFile('    x = Dense(' + str(units) + ', activation=' + act_func + ', name=' + layer_name + ')(x)\n')
					elif layer.split('-')[0] == 'Dropout':
						rate = float(layer.split('-')[1])
						seed = layer.split('-')[2]
						layer_name = layer.split('-')[3].lower()
						if seed != 'None':
							if counter == 0:
								x = Dropout(rate=rate, seed=int(seed))(inputs)
							else:
								x = Dropout(rate=rate, seed=int(seed))(x)
							saveToFile('    x = Dropout(' + str(rate) + ', seed=' + seed + ')(x)\n')
						else:
							if counter == 0:
								x = Dropout(rate=rate)(inputs)
							else:
								x = Dropout(rate=rate)(x)
							saveToFile('    x = Dropout(' + str(rate) + ')(x)\n')
					elif layer.split('-')[0] == 'Fire_function':
						act_func = layer.split('-')[1].lower()
						filters_squeezed = int(layer.split('-')[2])
						filters_expanded = int(layer.split('-')[3])
						kernel_height = int(layer.split('-')[4])
						kernel_width = int(layer.split('-')[5])
						stride_height = int(layer.split('-')[6])
						stride_width = int(layer.split('-')[7])
						padding = layer.split('-')[8].lower()
						layer_name = layer.split('-')[9].lower()
						if counter == 0:
							x = fire_module(inputs, layer_name, squeeze=filters_squeezed, expand=filters_expanded, activation=act_func, kernel_height=kernel_height, kernel_width=kernel_width, stride_height=stride_height, stride_width=stride_width, padding=padding)
						else:
							x = fire_module(x, layer_name, squeeze=filters_squeezed, expand=filters_expanded, activation=act_func, kernel_height=kernel_height, kernel_width=kernel_width, stride_height=stride_height, stride_width=stride_width, padding=padding)
						saveToFile('    fire_module(x, ' + layer_name + ', squeeze=' + str(filters_squeezed) + ', expand=' + str(filters_expanded) + ', activation=' + act_func + ', kernel_height=' + str(kernel_height) + ', kernel_width=' + str(kernel_width) + ', stride_height=' + str(stride_height) + ', stride_width=' + str(stride_width) + ', padding=' + padding + ')\n')
					elif layer.split('-')[0] == 'Flatten':
						layer_name = layer.split('-')[1].lower()              
						if counter == 0:
							x = Flatten()(inputs)
						else:
							x = Flatten()(x)
						saveToFile('    x = Flatten()(x)\n')
					elif layer.split('-')[0] == 'GlobalAveragePooling2D':
						layer_name = layer.split('-')[1].lower()              
						if counter == 0:
							x = GlobalAveragePooling2D()(inputs)
						else:
							x = GlobalAveragePooling2D()(x)
						saveToFile('    x = GlobalAveragePooling2D()(x)\n')
					elif layer.split('-')[0] == 'MaxPool2D':
						pool_height = int(layer.split('-')[1])
						pool_width = int(layer.split('-')[2])
						stride_height = int(layer.split('-')[3])
						stride_width = int(layer.split('-')[4])
						padding = layer.split('-')[5].lower()
						layer_name = layer.split('-')[6].lower()               
						if counter == 0:
							x = MaxPool2D(pool_size=(pool_height, pool_width), strides=(stride_height, stride_width), padding=padding, name=layer_name)(inputs)
						else:
							x = MaxPool2D(pool_size=(pool_height, pool_width), strides=(stride_height, stride_width), padding=padding, name=layer_name)(x)
						saveToFile('    x = MaxPool2D(pool_size=(' + str(pool_height) + ', ' + str(pool_width) + '), strides=(' + str(stride_height) + ', ' + str(stride_width) + '), padding=' + padding + ', name=' + layer_name + ')(x)\n')

					counter += 1

				model = Model(inputs=inputs, outputs=x)
			model.compile(optimizer=optimizer, loss='binary_crossentropy', metrics=['accuracy'])

			saveToFile('Model built successfully\n')

			return model

	except Exception as e:
		saveToFile(str(e) + '\n')

def loadWeights(model, src):
	model.load_weights(filepath=src)
	return model

def predictData(model_weights, x):
	prediction = model_weights.predict(x)
	return prediction

def translate_output(output):
	#This method interprets the model output.
	#It returns the diagnostic and its probability.

	for i in range(output.shape[0]):
		index_max_prob = np.argmax(output[i])
		for j in range(output.shape[1]):
			if j != index_max_prob:
				output[i][j] = 0
			else:
				output[i][j] = 1
	return output

if __name__ == '__main__':
	try:
		layers = sys.argv[1]
		optimizer = sys.argv[2]
		weights_name = sys.argv[3].split('.data-')[0]
		img = sys.argv[4]
		imgs = img.split('|')
		imgs.pop(-1)
		number_of_classes = int(sys.argv[5])

		file = open(path.replace('/scripts/python', '') + '/' + 'prediction_logs/prediction.log', 'a')
		file.write('Model: ' + layers.split('#')[0] + '\n')
		file.write('Weights: ' + weights_name + '\n')
		file.write('Optimizer: ' + optimizer + '\n\n')
		file.close()
		model = create(layers, optimizer, path.replace('/scripts/python', '') + '/' + imgs[0], number_of_classes)
		for img in imgs:
			if img != '':
				data = create_tensor(path.replace('/scripts/python', '') + '/' + img) # from cmd
				data = np.reshape(data, (1,) + data.shape)
				model_weights = loadWeights(model, path.replace('/scripts/python', '') + '/models/' + weights_name)
				prediction = predictData(model_weights, data)
				pred_one_hot = translate_output(prediction)
				index_max_prob = np.argmax(pred_one_hot)
				print('Predicted class:', index_max_prob)
				file = open(path.replace('/scripts/python', '') + '/' + 'prediction_logs/prediction.log', 'a')
				file.write(img + ' => Predicted class: ' + str(index_max_prob) + '\n')
				file.close()

	except Exception as e:
		print(str(e))