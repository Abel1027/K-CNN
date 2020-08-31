import os
import sys
import cv2
import dicom
import pydicom
import PIL
import numpy as np
from cnn import Models
from keras import Input
from keras.models import Model
from keras.layers import Activation, BatchNormalization, Conv2D, Dense, Dropout, Flatten, GlobalAveragePooling2D, MaxPool2D, concatenate
from keras.callbacks import ModelCheckpoint, ReduceLROnPlateau, LearningRateScheduler, EarlyStopping
from keras.callbacks import Callback
from keras.utils import np_utils
from keras.applications.inception_v3 import InceptionV3
from keras.applications import MobileNet
from keras.applications.vgg16 import VGG16
from keras.preprocessing.image import ImageDataGenerator
from sklearn.model_selection import train_test_split
from time import localtime
from datetime import datetime
path = os.getcwd().replace('\\', '/')
#path = path.replace('/scripts/python', '') # from cmd

def saveToFile(line):
	print(line)
	#file = open(path + '/output/output.log', 'a') # from cmd
	file = open(path + '/scripts/python/output/output.log', 'a') # from php
	file.write(line)
	file.close()

def getClasses(src):

	#Input parameters
	#src: path where is found the dataset containing every class.

	dataset_classes = os.listdir(src) #In 'dataset_classes' are listed the class folders.
	if len(dataset_classes) == 0: raise Exception('No classes found in dataset ' + src.split('/')[-1])

	class_tensors = []
	labels = []
	label = 0
	for class_ in dataset_classes:
		tensor, Y = folder(src + '/' + class_, label)
		labels.append(Y)
		tensor_keras = formatKeras(tensor) #It formats images tensor to make it compatible with keras.
		class_tensors.append(tensor_keras)
		label += 1

	dataset = []
	for class_ in class_tensors:
		for data in class_:
			dataset.append(data)
	datasets = np.array(dataset)
	
	labels_to_list = []
	for label_array in labels:
		for l in label_array:
			labels_to_list.append(l)

	labels = np_utils.to_categorical(labels_to_list, len(dataset_classes)) #It converts a class vector (integer) to a binary class matrix (ex: to use
										  #with categorical_crossentropy).
										  #Output: [1. 0.] for a class and [0. 1.] for the other class.

	labels = labels.astype('float16') #Stores it as a float16 cause it is the minor possible unit to storage data and with
								#it is possible to contribute with minor data capacity.

	return datasets, labels

def folder(src, label):

	#This method creates a numpy tensor from an images folder.

	#Input parameters
	#src: class folder path.

	#Outputs:
	#imgs: numpy tensor

	#Compatible formats list of the input images.
	formats = ('dcm','jpg','jpeg','jpe','jp2','webp','pbm','pgm','ppm','sr','ras','tiff','tif','png','bmp','dib')
	imgs = os.listdir(src) #In "imgs" are listed the folders on the specified path ("positive" or "negative").

	#In "valids" are listed the files that are found in the specified folder with the formats that appear on the
	#tuple "formats".
	valids = [i for i in imgs if
				os.path.isfile(src+'/'+i) and
				i.split('.')[-1] in formats]
	if len(valids) == 0: raise Exception('There is not images on class ' + src.split('/')[-1])

	num = len(valids) #"num" represents the amount of valid images.

	if imgs[0].split('.')[-1] == 'dcm': im = parse(src + '/' + imgs[0])
	else: im = cv2.imread(src + '/' + imgs[0], 0)
	imshape0 = im.shape[0]
	imshape1 = im.shape[1]

	#It creates a tensor that hold "num" generic images with the format specified in "format".
	imgs = np.zeros(shape = ((num,)+(imshape0,imshape1)), dtype = np.uint8 )

	Y = np.zeros(shape=num, dtype='uint8')

	saveToFile('Loading images (class' + str(label) + ')...\n')

	#For every image in "valids".
	for index, image in enumerate(valids):
		imgs[index] = load_img(src + '/' + image, format=(imshape0,imshape1))
		Y[index] = label
		c = int(100 * index/num)
		saveToFile('	' + str(c) + '% completed\n')

	saveToFile('	100% completed\n')
	saveToFile('--------------------\n')
	return imgs, Y #Return images tensor and their associated labels.

def load_img(address, format=(256, 204), reduction=cv2.INTER_AREA):

	#Input parameters
	#address: image address.
	#format: shape that the image will has.
	#reduction: interpolation to reshape images.

	#Outputs:
	#image: modified image.


	formats = ('dcm','jpg','jpeg','jpe','jp2','webp','pbm','pgm','ppm','sr','ras','tiff','tif','png','bmp','dib')

	if os.path.isdir(address): raise Exception('The path is referred to a folder...') #It should be to an image.

	extension = address.split('.')[-1]
	if extension not in formats: raise Exception('The format .' + extension + ' is not supported')

	if extension == 'dcm': image = parse(address)
	else: image = cv2.imread(address, 0) #It loads an image in gray scale.

	if image.shape != format: image = cv2.resize(image, dsize = format, interpolation = reduction)
	return image #Returns the image in gray scale and reshaped.

def parse(address):
	#This method loads a 12bits dicom image and returns a numpy array of 8bits.

	#Input parameters
	#address: contains the absolute direction and name of the file.

	#Outputs
	#image: decompressed numpy array of 8bits representing correctly the image.


	#file = dicom.read_file(address)
	file = pydicom.dcmread(address)

	if ('PixelData' not in file):
	   raise TypeError("File doesn't contain an image.")

	elif ('WindowWidth' not in file) or ('WindowCenter' not in file):
	   raise TypeError("File doesn't contain fields to decompress the image")

	else:
		image = get_LUT_value(file.pixel_array, file.WindowWidth, file.WindowCenter)
		image = PIL.Image.fromarray(image).convert('L')
		image = np.array(image)
		if np.median(image) > 100: image = invert(image) #This is a decision to invert or not the images.
		return image

def invert(pixel):
	return 255-pixel

def get_LUT_value(data, window, level):
	# This method apply the RGB Look-Up Table for the given data and window/level value.
	return np.piecewise(data,
					   [data <= (level - 0.5 - (window - 1) / 2),
						data > (level - 0.5 + (window - 1) / 2)],
					   [0, 255, lambda data: ((data - (level - 0.5)) / (window - 1) + 0.5) * (255 - 0)])

def formatKeras(imgs):

	#This method formats a numpy tensor to make it compatible with keras.

	#Input parameters
	#imgs: it can be a single image with shape (height, width) or a tensor (instance number, height, width).

	#Outputs
	#imgs: Tensor with shape (instance number, height, width, 1). It is divided by 255 and saved as float16.


	#saveToFile('Formatting data...\n')
	imgs = np.divide(imgs, 255) #It divides every tensor image by 255 to normalize its pixels values between 0 and 1.
	imgs = imgs.reshape(imgs.shape + (1,))

	imgs = imgs.astype('float16') #It stores "imgs" as float16 cause this is the minor unit.
	#saveToFile('Data formatted correctly\n')
	#saveToFile('--------------------\n')
	return imgs

def train(model, x, y, epochs, val_data=None, batch_size=32, check='val_loss', dataset_folder='default', best_model=True, min_lr=0.0001, model_name='MyModel', transf=False):
	saveToFile('\nTraining...\n')

	pathForModel = path + '/models'

	date = datetime.now().strftime('%Y-%m-%d %H-%M-%S')
	pathForModel = pathForModel + '/' + date + ' ' + model_name
	if not os.path.isdir(pathForModel): os.mkdir(pathForModel)
	global outputFolder
	outputFolder = pathForModel.split('/')[-1]

	#If there is validation data it creates a file with .kras extension with the specified shape below.
	if val_data != None:
		pathForModel = pathForModel + '/' + ' epoch({epoch:02d})-acc({accuracy:.2f})-val_acc({val_accuracy:.2f})-loss({loss:.2f})-val_loss({val_loss:.2f}).kras'
		val = True
	else:
		#If there is not validation data it creates a file with .kras extension with the specified shape below.
		pathForModel = pathForModel + '/' + ' epoch({epoch:02d})-acc({accuracy:.2f})-loss({loss:.2f}).kras'
		val = False

	#It saves the model after every epoch in dependence of the monitored parameter ("check").
	if best_model == True:
		saveToFile('Training will save BEST model only\n')
	else:
		saveToFile('Training will save ALL models\n')
	saveToFile('Parameter to monitor: ' + check + '\n')
	checkpoint = ModelCheckpoint(filepath=pathForModel, monitor=check, verbose=1, save_weights_only=True,
								 save_best_only=best_model, mode='auto')

	Hist = Log(path, val=val) #It creates a file with name "history.log" inside date folder on trained model
						  #directories.

	#It reduces the model learning ratio in dependence of the parameter to monitor ("check").
	RLR = ReduceLROnPlateau(monitor=check, factor=0.5, patience=5, verbose=0, mode='auto',
									epsilon=0.0001, cooldown=0, min_lr=min_lr)

	#It stops training when the monitored parameter ("check") remains the same value in next epochs.
	#Early = EarlyStopping(monitor=check, patience=100, verbose=True)
	Early = EarlyStopping(monitor=check, patience=epochs, verbose=True)

	#Model learning ratio scheduler.
	LR = LearningRateScheduler(setLr)

	BM = Best_mean2(cycles = 100, check = 'val_loss')

	LRR = Lr_reset()

	Mine = Best_with_lr_reset(10)

	#It adapts the input and output datasets to the current model to train in a static way. It establishes extra
	#parameters.

	if transf == False:
		saveToFile('Transformations during training DISABLED\n')
		hist = model.fit(x=x, y=y, epochs=epochs,
									batch_size=batch_size,
									validation_data=val_data, callbacks=[checkpoint, Hist, RLR, Early])
	else:
		saveToFile('Transformations during training ENABLED\n')
		generator = ImageDataGenerator(rotation_range=10, width_shift_range=0.1, vertical_flip=True,
		                         height_shift_range=0.1, zoom_range=0.2, horizontal_flip=True,
		                         fill_mode='constant', cval=0.1, data_format='channels_last')

		generator = ImageDataGenerator(rotation_range=15, fill_mode = 'nearest')

		if val_data != None:
			hist = model.fit_generator(generator.flow(x, y, batch_size),
			                              steps_per_epoch = len(x) // batch_size,
			                              epochs=epochs, 
			                              validation_data=val_data, 
			                              validation_steps= len(val_data[0]) // batch_size, 
			                              callbacks=[checkpoint, Hist, RLR, Early])
		else:
			hist = model.fit_generator(generator.flow(x, y, batch_size),
			                              steps_per_epoch = len(x) // batch_size,
			                              epochs=epochs, 
			                              callbacks=[checkpoint, Hist, RLR, Early])
	'''
	date = localtime() #It obtains the local date and time.
	file = path + '/model_logs/' + str(date.tm_min) + '.log' #It will creates a file with .log extension on trained model
	#directories.
	write = open(file, 'w') #It opens the new created file and it establishes write mode.

	epoch = 1 #First epoch.
	try:
	#If there is a validation dataset -> In every iteration (every epoch) where it was saved the next parameters...
		for (acc,val_acc,loss,val_loss) in zip(hist.history['acc'],
			hist.history['val_acc'], hist.history['loss'],
			hist.history['val_loss']):
				write.writelines('Epoch:' + str(epoch)+ '\n') #It writes the current data epoch in the file with
															  #.log extension.
				write.writelines('acc:' + str(acc) + ' val_acc:' + str(val_acc) + ' loss:' + str(loss) + ' val_loss:' + str(val_loss) + '\n')
				epoch += 1 #Next epoch.

	except KeyError:
	#If there is not a validation dataset -> In every iteration (every epoch) where it was saved the next parameters...
		for (acc, loss) in zip(hist.history['acc'],
			hist.history['loss']):
				write.writelines('Epoch:' + str(epoch) + '\n') #It writes the current data epoch in the file with .log
														   #extension.
				write.writelines('acc:' + str(acc) + ' loss:' + str(loss) + '\n')
				epoch += 1
	write.close() #It closes the file with .log extension where were saved all data parameters of every training epoch.
	'''

class Log(Callback):
	def __init__(self, dst, val=False):
		self.dst = dst
		self.dst_l = self.dst + '/model_logs'
		if val: self.labels = ('loss', 'accuracy', 'val_loss', 'val_accuracy') #If it exists a validation dataset it considers the
																	 #specified parameters.
		else: self.labels = ('loss', 'accuracy') #If it doesn't exist a validation dataset it considers the specified parameters.

	def on_epoch_end(self, epoch, logs={}):
		hist = 'epoch:' + str(epoch+1)
		for label in self.labels: hist += ' ' + label + ':' + str(logs.get(label))

		date = datetime.now().strftime('%Y-%m-%d %H:%M:%S ')
		save = open(self.dst_l + '/history.log', 'a') #It creates a file with .log extension and in it is established a
													#data appendix, in the end of the file, corresponding to each
													#training iteration (epoch).
		save.writelines(date + hist + '\n') #It writes the data of every epoch in that file.
		saveToFile('	' + date + hist + '\n')

		file = open(self.dst + '/scripts/python/output/status.log', 'r')
		lines = file.readlines()
		file.close()

		if len(lines) > 0 and lines[0] == 'stop':
			global outputFolder
			saveToFile('Training stopped successfully -> Output folder: ' + outputFolder + '\n')
			file = open(self.dst + '/scripts/python/output/status.log', 'w')
			file.close()
			sys.exit()

def setLr(epoch):
	if epoch < 400: return 0.001
	elif epoch >= 400 and epoch < 700: return 0.0005
	elif epoch >= 700 and epoch < 900: return 0.0001
	elif epoch >= 900 and epoch < 1000: return 0.00001
	else: return 0.000001

class Best_mean2(Callback):
	def __init__(self, cycles = 50,
				 check = 'val_loss'):
		self.cycles = cycles
		self.check = check
		self.h = []
		self.weights = None
		self.counter = 0
		self.m1 = 0
		self.m2 = 0

class Lr_reset(Callback):
	def __init__(self, cycles = 10, decay = 0.95,
				 max_lr = 0.01, min_lr = 0.00001):
		self.cycles = cycles
		self.counter = 0
		self.decay = decay
		self.max_lr = max_lr
		self.min_lr = min_lr

class Best_with_lr_reset(Callback):
	def __init__(self, cycles = 50,
				 max_lr = 0.01, min_lr = 0.00001, check = 'val_loss'):
		self.cycles = cycles
		self.counter = cycles
		self.check = check
		self.best_value = 20
		self.best_weights = None
		self.max_lr = max_lr
		self.min_lr = min_lr

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

def create(layers, optimizer, monitoring, bestModel, lr, epochs, batch, validation, dataset, transf):
	if transf == 'True':
		transf = True
	else:
		transf = False

	model_name = layers.split('#')[0]
	layers_list = layers.split('#')[1].split('--')

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
		saveToFile('\n########################################\n')
		saveToFile('Dataset: ' + dataset + '\n')
		if dataset != '':
			# checking the last layer that provides the number of classes
			last_layer_index = len(layers_list)-1
			for i in range(len(layers_list)):
				if layers_list[i].split('-')[0] == 'Conv2D' or layers_list[i].split('-')[0] == 'Dense':
					last_layer_index = i

			saveToFile('Optimizer: ' + optimizer + '\n')
			saveToFile('Monitoring parameter: ' + monitoring.split('_')[0] + ' ' + monitoring.split('_')[1] + '\n')
			if monitoring == 'Validation_loss':
				monitoring = 'val_loss'
			elif monitoring == 'Training_loss':
				monitoring = 'loss'
			elif monitoring == 'Validation_accuracy':
				monitoring = 'val_acc'
			else:
				monitoring = 'acc'
			saveToFile('Save best model: ' + bestModel + '\n')
			if bestModel == 'No':
				bestModel = False
			else:
				bestModel = True
			saveToFile('Learning rate: ' + lr + '\n')
			saveToFile('Number of epochs: ' + epochs + '\n')
			saveToFile('Batch size (%): ' + batch + '\n')
			saveToFile('Validation dataset size (%): ' + validation + '\n')

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

			data, labels = getClasses(path.replace('/scripts/python', '') + '/uploads/' + dataset) # from cmd
			print(data.shape)
			print(labels.shape)

			saveToFile('Creating validation dataset and assigning batch size...\n')
			# creating validation dataset randomly

			if float(validation) != 0:
				data, data_val, labels, labels_val = train_test_split(data, labels, test_size=float(validation)/100, random_state=42)
				saveToFile('	Training dataset size: ' + str(data.shape[0]) + '\n')
				saveToFile('	Validation dataset size: ' + str(data_val.shape[0]) + '\n')
				val_data = (data_val, labels_val)
			else:
				val_data = None

			# batch size
			batch_size = int(float(batch) * data.shape[0] / 100)
			if batch_size == 0:
				batch_size = 1
			# else:
			# 	for i in range(data.shape[0]):
			# 		if data.shape[0] % batch_size == 0:
			# 			break
			# 		else:
			# 			batch_size += 1

			saveToFile('	Batch size: ' + str(batch_size) + '\n')

			train(model, data, labels, int(epochs), val_data=val_data, batch_size=batch_size, check=monitoring, dataset_folder='default', best_model=bestModel, min_lr=float(lr), model_name=model_name, transf=transf)

			global outputFolder
			saveToFile('Dataset trained successfully -> Output folder: ' + outputFolder + '\n')
			saveToFile('########################################\n')

	except Exception as e:
		saveToFile(str(e) + '\n')

if __name__ == '__main__':
	layers = sys.argv[1]
	optimizer = sys.argv[2]
	monitoring = sys.argv[3]
	bestModel = sys.argv[4]
	lr = sys.argv[5]
	epochs = sys.argv[6]
	batch = sys.argv[7]
	validation = sys.argv[8]
	dataset = sys.argv[9]
	transf = sys.argv[10]

	create(layers, optimizer, monitoring, bestModel, lr, epochs, batch, validation, dataset, transf)