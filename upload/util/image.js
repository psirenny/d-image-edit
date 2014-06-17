var _ = require('lodash');

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

  if (!image) return callback(null, null);
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  canvas.toBlob(function (blob) {
    callback(null, blob);
  });
};

exports.transform = function (image, matrix, fromWidth, fromHeight, toWidth, toHeight, callback) {
  console.log(matrix);
  if (!matrix) return callback(image);

  var canvas = document.createElement('canvas')
    , ctx = canvas.getContext('2d')
    , ratioX = toWidth / fromWidth
    , ratioY = toHeight / fromHeight
    , scaleX = matrix[0] * ratioX
    , scaleY = matrix[3] * ratioY
    , originX = (image.width / 2) * (1 - scaleX)
    , originY = (image.height / 2) * (1 - scaleY)
    , offsetX = (image.width / 2) * (ratioX - 1)
    , offsetY = (image.height / 2) * (ratioY - 1)
    , translateX = matrix[4] * ratioX + offsetX
    , translateY = matrix[5] * ratioY + offsetY
    , transformedMatrix = [scaleX, 0, 0, scaleY, originX + translateX, originY + translateY]
    , transformedImage = new Image();

  transformedImage.onload = function () {
    callback(null, transformedImage);
  };

  canvas.width = toWidth;
  canvas.height = toHeight;
  ctx.transform.apply(ctx, transformedMatrix);
  ctx.drawImage(image, 0, 0);
  transformedImage.src = canvas.toDataURL('image/png');
};
