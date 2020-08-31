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
from vis.utils import utils
from vis.visualization import visualize_activation
from vis.visualization import visualize_saliency
from vis.visualization import visualize_cam
from training import load_img, formatKeras, parse
from matplotlib import pyplot as plt
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

def create(layers, optimizer, dataset, img):
	model_name = layers.split('#')[0]
	layers_list = layers.split('#')[1].split('--')

	img_path = path.replace('/scripts/python', '') + '/uploads/' + dataset + '/' + img
	classPath = path.replace('/scripts/python', '') + '/uploads/' + dataset
	classes = os.listdir(classPath)
	number_of_classes = len(classes)
	imgs = os.listdir(classPath + '/' + classes[0])
	if imgs[0].split('.')[-1] == 'dcm': im = parse(classPath + '/' + classes[0] + '/' + imgs[0])
	else: im = cv2.imread(classPath + '/' + classes[0] + '/' + imgs[0], 0)
	imshape0 = im.shape[0]
	imshape1 = im.shape[1]
	input_format=(imshape0, imshape1, 1)

	inputs = Input(shape=input_format, name='Input')

	try:
		if dataset != '':
			# checking the last layer that provides the number of classes
			last_layer_index = len(layers_list)-1
			for i in range(len(layers_list)):
				if layers_list[i].split('-')[0] == 'Conv2D' or layers_list[i].split('-')[0] == 'Dense':
					last_layer_index = i

			counter = 0
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

			data = create_tensor(img_path) # from cmd
			print(data.shape)
			return model, data, counter-1

	except Exception as e:
		saveToFile(str(e) + '\n')

def loadWeights(model, src):
	model.load_weights(filepath=src)
	return model

def predictData(model_weights, x):
	prediction = model_weights.predict(x)
	return prediction

def recover(dataset):
    #This method modifies the dataset format to visualize it.

    new_shape = tuple([i for i in dataset.shape if i != 1]) #It stores in a tuple named "new_shape" the input
                                                            #dataset format.
    imgs = dataset.reshape(new_shape) #It formats dataset again.
    imgs = np.multiply(imgs, 255) #It multiplies every pixel of the images from the dataset by 255 to denormalize it.
    imgs = np.round(imgs) #Round every value of the dataset (pixels).
    imgs = imgs.astype('uint8') #Defines every value of the dataset as "uint8".
    return imgs

def visualize_grad(model_weights, data):
	#model: trained model.
	#data: preprocessed image by keras.

	#Note: Put "name = 'predictions'" on the last layer of every model (layer that include 'softmax'). This layer will
	#be the one we gonna visualize to standardize architectures.

	#layer_idx = [idx for idx,layer in enumerate(model.layers) if layer.name == layer_name][0]
	layer_idx = -1

	#original = np.copy(recover(data))
	#cv2.imwrite(path.replace('/scripts/python', '') + '/heatmaps/' + 'original.png', original)

	img = np.reshape(data, (1,) + data.shape)
	prediction = predictData(model_weights, img)
	pred_class = np.argmax(prediction)
	print('image shape: ', img.shape)
	print('prediction: ', prediction)
	print('class: ', pred_class)

	#model_weights.layers[layer_idx].activation = activations.linear
	#model_weights = utils.apply_modifications(model_weights)

	heatmap_activation = visualize_activation(model_weights, layer_idx, filter_indices=pred_class, seed_input=img)
	#plt.rcParams['figure.figsize'] = (18, 6)
	heatmap_activation = np.squeeze(heatmap_activation, axis=2)
	#plt.imshow(heatmap_activation, cmap='jet')
	plt.imsave(path.replace('/scripts/python', '') + '/heatmaps/' + 'activation.png', heatmap_activation, cmap='jet')
	#plt.show()
	#cv2.imwrite(path.replace('/scripts/python', '') + '/heatmaps/' + 'activation.png', heatmap_activation)

	heatmap_saliency = visualize_saliency(model_weights, layer_idx, filter_indices=pred_class, seed_input=img)
	#plt.rcParams['figure.figsize'] = (18, 6)
	#heatmap_saliency = np.squeeze(heatmap_saliency, axis=2)
	#plt.imshow(heatmap_saliency, cmap='jet')
	plt.imsave(path.replace('/scripts/python', '') + '/heatmaps/' + 'saliency.png', heatmap_saliency, cmap='jet')
	#plt.show()	
	#cv2.imwrite(path.replace('/scripts/python', '') + '/heatmaps/' + 'saliency.png', heatmap_saliency)

	heatmap_saliency_g = visualize_saliency(model_weights, layer_idx, filter_indices=pred_class, seed_input=img, backprop_modifier='guided')
	plt.imsave(path.replace('/scripts/python', '') + '/heatmaps/' + 'saliency_guided.png', heatmap_saliency_g, cmap='jet')

	heatmap_saliency_r = visualize_saliency(model_weights, layer_idx, filter_indices=pred_class, seed_input=img, backprop_modifier='relu')
	plt.imsave(path.replace('/scripts/python', '') + '/heatmaps/' + 'saliency_relu.png', heatmap_saliency_r, cmap='jet')

	heatmap_cam = visualize_cam(model_weights, layer_idx, filter_indices=pred_class, seed_input=img)
	#plt.rcParams['figure.figsize'] = (18, 6)
	#heatmap_cam = np.squeeze(heatmap_cam, axis=2)
	#plt.imshow(heatmap_cam, cmap='jet')
	plt.imsave(path.replace('/scripts/python', '') + '/heatmaps/' + 'cam.png', heatmap_cam, cmap='jet')
	#plt.show()
	#cv2.imwrite(path.replace('/scripts/python', '') + '/heatmaps/' + 'cam.png', heatmap_cam)

if __name__ == '__main__':
	try:
		# layers = 'LeNet#Conv2D-ReLU-64-3-3-1-1-Same-l1--MaxPool2D-3-3-2-2-Same-l2--Conv2D-ReLU-128-3-3-1-1-Same-l3--MaxPool2D-3-3-2-2-Same-l4--Dropout-0.1-None-l5--Flatten-l6--Dense-ReLU-256-l7--Dense-ReLU-256-l8--Dropout-0.5-None-l9--Dense-Softmax-2-l10--';
		# optimizer = 'Adam'
		# dataset = 'dataset1'
		# weights_name = '2020-07-29 17-27-35 LeNet/ epoch(03)-acc(0.75)-val_acc(0.50)-loss(0.69)-val_loss(0.69).kras'
		# img = 'class0/image_00001 125_110_2_5_0.3_0.2_0.2.png'

		layers = sys.argv[1]
		optimizer = sys.argv[2]
		dataset = sys.argv[3]
		weights_name = sys.argv[4].split('.data-')[0]
		img = sys.argv[5]
		img = img.split('/')[-2] + '/' + img.split('/')[-1]

		model, data, layer_id = create(layers, optimizer, dataset, img)	
		model_weights = loadWeights(model, path.replace('/scripts/python', '') + '/models/' + weights_name)

		visualize_grad(model_weights, data)

	except Exception as e:
		print(str(e))