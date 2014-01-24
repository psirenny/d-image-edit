var canvasToBlob = require('blueimp-canvas-to-blob/js/canvas-to-blob');

exports.create = function (data, callback) {
  var image = new Image()
    , reader = new FileReader();

  if (typeof data === 'string') {
    image.src = data;
    return callback(null, image);
  }

  reader.onload = function (e) {
    image.src = e.target.result;
    callback(null, image);
  };

  reader.readAsDataURL(data);
};

exports.resize = function (image, width, height, callback) {
  var canvas = document.createElement('canvas')
    , context = canvas.getContext('2d')
    , resizedImage = new Image();

  if (image.width === width && image.height === height) {
    return callback(null, image);
  }

  resizedImage.onload = function () {
    callback(null, resizedImage);
  };

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);
  resizedImage.src = canvas.toDataURL('image/png');
};

exports.toBlob = function (image, callback) {
  var canvas = document.createElement('canvas')
    , context = canvas.getContext('2d');

  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image, 0, 0);
  canvas.toBlob(function (blob) {
    callback(null, blob);
  });
};

exports.transform = function (image, matrix, containerWidth, containerHeight, callback) {
  var canvas = document.createElement('canvas')
    , context = canvas.getContext('2d')
    , x = (image.width - image.width * matrix[0]) / 2
    , y = (image.height - image.height * matrix[3]) / 2
    , transformedImage = new Image();

  transformedImage.onload = function () {
    callback(null, transformedImage);
  };

  canvas.width = containerWidth;
  canvas.height = containerHeight;
  context.translate(x, y);
  context.transform.apply(context, matrix);
  context.drawImage(image, 0, 0);
  transformedImage.src = canvas.toDataURL('image/png');
};