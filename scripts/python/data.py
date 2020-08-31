import os
from keras.utils import np_utils
import numpy as np
import cv2
import dicom
import pydicom
import PIL
from keras.preprocessing.image import ImageDataGenerator

class Data:

    #This class prepares input data for processing.

    def createDataset(self, src, dst, format=(256, 204), aug=0, rr=10, wsr=0.1, hs=0.1, zr=0.2):

        #This method creates a ready dataset to train, compatible with keras, and allows separate it
        #in another different dataset for validation and it can be augmented if is required by
        #static way.

        #Input parameters
        #src: address where is the dataset containing every class (ex: "positive" and "negative"), there will be images from every category.
        #dst: address where will storage the dataset, the method will create the dataset folder
        #format: shape that images will has.
        #aug: integer number that express how many copies the method will generate for every image.

        string_operations = str(format[1]) + '_' + str(format[0]) + '_' + str(aug) + '_' + str(rr) + '_' + str(hs) + '_' + str(wsr) + '_' + str(zr)

        class_tensors = self.getClasses(src, format=format) #class_tensors is a list containing the images from every class (ex: "positive" and "negative") respectively.
        dataset_classes = os.listdir(src)

        class_tensors_keras = []
        for class_tensor in class_tensors:
            class_tensors_keras.append(self.formatKeras(class_tensor)) #It formats images tensor to make it compatible with keras.

        for index, class_tensor_keras in enumerate(class_tensors_keras):
            if aug > 0:
                #print(class_tensor_keras.shape)
                class_tensor_keras_augmented = self.augmentData(class_tensor_keras, aug, rr=10, wsr=0.1, hs=0.1, zr=0.2)
                self.saveDataset(class_tensor_keras_augmented, dst_dataset=dst, dst_class=dst + '/' + dataset_classes[index], string_operations=string_operations)
            else:
                self.saveDataset(class_tensor_keras, dst_dataset=dst, dst_class=dst + '/' + dataset_classes[index], string_operations=string_operations)

    def getClasses(self, src, format=(256, 204)):

        #Input parameters
        #src: path where is found the dataset containing every class.

        dataset_classes = os.listdir(src) #In 'dataset_classes' are listed the class folders.
        if len(dataset_classes) == 0: raise Exception('No classes found.')

        class_tensors = []
        for class_ in dataset_classes:
            class_tensors.append(self.folder(src + '/' + class_, format=format))

        return class_tensors

    def folder(self, src, format=(256, 204), reduction = cv2.INTER_AREA):

        #This method creates a numpy tensor from an images folder.

        #Input parameters
        #src: class folder path.
        #format: shape that images will has.
        #reduction: interpolation to reshape images.

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
        if len(valids) == 0: raise Exception('There is not images on folder.')

        num = len(valids) #"num" represents the amount of valid images.

        #It creates a tensor that hold "num" generic images with the format specified in "format".
        imgs = np.zeros(shape = ((num,)+(format[1],format[0])), dtype = np.uint8 )

        print('Loading images...')

        #For every image in "valids".
        for index, image in enumerate(valids):
            imgs[index] = load_img(src + '/' + image, format, reduction)
            c = int(100 * index/num)
            print(str(c) + '% completed.')

        print('100% completed.')
        print('--------------------')
        return imgs #Return images tensor.

    def combineClasses(self, positive, negative):
        total = positive.shape[0] + negative.shape[0] #"total" holds the total number of images (both classes).
        format = ((total,) + (positive.shape[1], positive.shape[2])) #Images format for classes combination (same as processed
                                                             #images).

        #It creates a tensor that holds "total" generic images with the specified format in "format".
        X = np.zeros(shape = format, dtype = 'uint8')

        #It creates an array that holds "total" elements (classes combination). It will represent the classification of
        #every image.
        Y = np.zeros(shape = total, dtype = 'uint8')

        random = np.arange(total) #It creates a successive numbers array of "total" length.
        np.random.shuffle(random) #It randomizes the sequence.

        #Negative patients has a '0' output tag and the positive patients has a '1' output tag.

        pointer_positive = random[0:positive.shape[0]] #"pointer_positive" stores a random sequence of "positive" class length.
        pointer_negative = random[positive.shape[0]:] #"pointer_negative" stores a random sequence of "negative" class length.

        for h,i in enumerate(pointer_positive):
            X[i] = positive[h] #It chooses images from "positive" tensor randomly.
            Y[i] = 1 #It assigns '1' as output to that images (positive).

        for h,i in enumerate(pointer_negative):
            X[i] = negative[h] #It chooses images from "negative" tensor randomly.

        #It returns a tensor (X) with images from "positive" and "negative" classes randomly.
        #It returns an array (Y) with '1' and '0' elements distributed in correspondence with tensor (X).
        return X,Y

    def formatKeras(self, imgs):

        #This method formats a numpy tensor to make it compatible with keras.

        #Input parameters
        #imgs: it can be a single image with shape (height, width) or a tensor (instance number, height, width).

        #Outputs
        #imgs: Tensor with shape (instance number, height, width, 1). It is divided by 255 and saved as float16.


    	print('Formatting data...')
    	imgs = np.divide(imgs, 255) #It divides every tensor image by 255 to normalize its pixels values between 0 and 1.
    	imgs = imgs.reshape(imgs.shape + (1,))

    	imgs = imgs.astype('float16') #It stores "imgs" as float16 cause this is the minor unit.
    	print('Data formatted correctly.')
    	print('--------------------')
    	return imgs

    def split(self, x, y, val):
        num_val = int(val * len(x)) #"num_val" stores the number of images that will be taken for validation.

        x_val = x[0:num_val] #"x_val" is an images tensor with "num_val" images.
        y_val = y[0:num_val] #"y_val" is a binary class matrix with "num_val" elements representing an output in
                             #correspondence with "x_val" tensor.

        x = x[num_val:] #'x' will be the resulting tensor that will be trained.
        y = y[num_val:] #'y' will be the resulting outputs binary classes matrix, in correspondence with 'x' tensor.
        return x, y, x_val, y_val

    def augmentData(self, x, multiplier, rr=10, wsr=0.1, hs=0.1, zr=0.2):
        print('--------------------')
        print('Augmenting images number...')

        num_examples = len(x) #"num_examples" stores the images number that 'x' tensor holds.
        total_examples = multiplier * num_examples #"total_examples" stores the images number that 'x' tensor will has
                                                 #when it augments its capacity.

        #It creates a tensor that holds "total_examples" generic images with the 'x' tensor format (with exception of
        #the first parameter = total_examples).
        new_x = np.zeros((total_examples,) + x.shape[1:])
        new_x = new_x.astype('float16') #It stores "new_x" as float16 cause this is the minor unit.

        #Images generator with random transformations.
        generator = ImageDataGenerator(rotation_range=rr, width_shift_range=wsr, vertical_flip=True,
                             height_shift_range=hs, zoom_range=zr, horizontal_flip=True,
                             fill_mode='constant', cval = 0.1, data_format='channels_last')


        for h, i in enumerate(x):
            print(str(int(h * 100 / num_examples))+'% completed.')
            i = i.reshape((1,) + i.shape) #For every 'x' tensor image it formats with instance number equal to '1'
                                          #(keep the rest of the format).
            new_x[h * multiplier] = i #After 'h' iterations adds image in "h * multiplier" position to "new_x" tensor.
            c = 0

            a = generator.flow(i, batch_size=1, shuffle = False)
            for copia in generator.flow(i, batch_size=1, shuffle = False):
                new_x[c + h * multiplier] = copia #It adds each copy of generated image in the specified position by
                                                  #"c + h * multiplier"
                if c == multiplier - 1: break
                c += 1

        print('100% completed.')
        print('Images number augmented.')
        print('--------------------')
        return new_x #New dataset augmented.

    def saveDataset(self, x, dst_dataset, dst_class, string_operations):

        #This method stores a dataset with numpy format.

        #Input parameters
        #x: input images tensor.
        #dst: destiny path where it will save the dataset. The method creates the folder.

        if not os.path.isdir(dst_class):
            if not os.path.isdir(dst_dataset): os.mkdir(dst_dataset)
            os.mkdir(dst_class)

            print('Saving data...')

            datasetToVisualize = self.recover(x)
            for index, new_img in enumerate(datasetToVisualize):
                indexFile = ''
                for i in range(5-len(str(index))):
                    indexFile = indexFile + '0'
                indexFile = indexFile + str(index)
                cv2.imwrite(dst_class + '/image_' + indexFile + ' ' + string_operations + '.png', new_img)

            #np.save(dst_class + '/x.npy', x) #It stores the images tensor in a numpy file with extension .npy.

            print('Data saved.')
            print('--------------------')
        else: raise Exception('There is already a class.')            

    def loadDataset(self, src = 'datasets/ready/dataset'):

        #This method loads a numpy dataset.

        #Input parameters
        #src: address of the folder that holds the files "x.npy" and "y.npy" and, opcional, "x_val.npy" and "y_val.npy".

        #Outputs
        #(x, y) if there is not the validation dataset on folder.
        #(x,y,x_val,y_val) in the other case.


        files = os.listdir(src) #In "files" are listed the files in the specified path (datsets folder).
        x = 'x.npy'
        y = 'y.npy'
        x_val = 'x_val.npy'
        y_val = 'y_val.npy'

        #If the input dataset (x, images) and the outputs dataset (y, outputs) exist then it loads that files in two
        #images and outputs tensors respectively.
        if x in files and y in files:
            x = np.load(src + '/' + x)
            y = np.load(src + '/' + y)

        #If the input validation dataset (x_val, images) and the outputs validation dataset (y_val, outputs) exist it
        #loads that files in two images and outputs tensors respectively (validation).
            if x_val in files and y_val in files:
                x_val = np.load(src + '/' + x_val)
                y_val = np.load(src + '/' + y_val)
                return x, y, x_val, y_val

            else: return x, y

    def loadClass(self, src, diagnostic = 'positive'):
    	labels = {'positive':1 , 'negative':0}
    	label = labels[diagnostic] #"label" will be "positive" or "negative" in dependence of the "diagnostic" parameter.

    	imgs = self.folder(src) #It creates a tensor of the correspondent class in dependence of the specified path.
    	x = self.formatKeras(imgs) #It formats the images tensor to make it compatible with keras.

        #If "label" is "positive" it creates an '1' outputs tensor and then it becomes to a binary classes matrix.
    	if label:
            y = np.ones(shape = x.shape[0], dtype='uint8')
            y = np_utils.to_categorical(y,2)

        #In return, if "label" is "negative" it creates an '0' outputs tensor and then it becomes to a binary classes matrix.
    	else:
            y = np.zeros(shape = x.shape[0], dtype='uint8')
            y = np_utils.to_categorical(y,2)
    	return x, y #It returns an images formatted tensor and an outputs tensor in correspondence with the loaded class.

    def recover(self, dataset):
        #This method modifies the dataset format to visualize it.

        new_shape = tuple([i for i in dataset.shape if i != 1]) #It stores in a tuple named "new_shape" the input
                                                                #dataset format.
        imgs = dataset.reshape(new_shape) #It formats dataset again.
        imgs = np.multiply(imgs, 255) #It multiplies every pixel of the images from the dataset by 255 to denormalize it.
        imgs = np.round(imgs) #Round every value of the dataset (pixels).
        imgs = imgs.astype('uint8') #Defines every value of the dataset as "uint8".

        return imgs

    def showDataset(self, x, y):

        #This method shows on screen every image and output of the inserted datasets as parameters respectively.

        #Input parameters
        #x: images dataset.
        #y: outputs dataset in correspondence with the images dataset.


        for i,img in enumerate(x):
            print(y[i])
            cv2.imshow('Image', img)
            cv2.waitKey(5) #It reproduces every image after 5 mili-seconds (if it use '0' it will reproduces every image
                           #every time a key were pressed).

def load_img(address, format = (256, 204), reduction = cv2.INTER_AREA):

        #Input parameters
        #address: image address.
        #format: shape that the image will has.
        #reduction: interpolation to reshape images.

        #Outputs:
        #image: modified image.


        formats = ('dcm','jpg','jpeg','jpe','jp2','webp','pbm','pgm','ppm','sr','ras','tiff','tif','png','bmp','dib')

        if os.path.isdir(address): raise Exception('The path is referred to a folder...') #It should be to an image.

        extension = address.split('.')[-1]
        if extension not in formats: raise Exception('The format .' + extension + ' is not supported.')

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