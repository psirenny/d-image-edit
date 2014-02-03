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
    , ctx = canvas.getContext('2d')
    , resizedImage = new Image();

  if (image.width === width && image.height === height) {
    return callback(null, image);
  }

  resizedImage.onload = function () {
    callback(null, resizedImage);
  };

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0, width, height);
  resizedImage.src = canvas.toDataURL('image/png');
};

exports.toBlob = function (image, callback) {
  var canvas = document.createElement('canvas')
    , ctx = canvas.getContext('2d');

  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  canvas.toBlob(function (blob) {
    callback(null, blob);
  });
};

exports.transform = function (image, matrix, canvasWidth, canvasHeight, callback) {
  var canvas = document.createElement('canvas')
    , ctx = canvas.getContext('2d')
    , x1 = (image.width - (image.width * matrix[0])) / 2
    , x2 = matrix[4] + x1
    , y1 = (image.height - (image.height * matrix[3])) / 2
    , y2 = matrix[5] + y1
    , transformedImage = new Image();

  transformedImage.onload = function () {
    callback(null, transformedImage);
  };

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  ctx.translate(x1, y1);
  ctx.transform.apply(ctx, matrix);
  ctx.scale(2, 2);
  ctx.translate(x2, y2);
  ctx.drawImage(image, 0, 0);
  transformedImage.src = canvas.toDataURL('image/png');
};