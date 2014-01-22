exports.create = function (file, callback) {
  var reader = new FileReader();

  reader.onload = function (e) {
    var image = new Image();
    image.src = e.target.result;
    callback(null, image);
  };

  reader.readAsDataURL(file);
};

exports.resize = function (image, width, height, callback) {
  var canvas = document.createElement('canvas')
    , context = canvas.getContext('2d')
    , resizedImage = image;

  if (image.width !== width || image.height === !height) {
    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);
    resizedImage = new Image();
    resizedImage.src = canvas.toDataURL('image/png');
  }

  callback(null, resizedImage);
};

exports.transform = function (image, matrix, containerWidth, containerHeight, callback) {
  var canvas = document.createElement('canvas')
    , context = canvas.getContext('2d')
    , x = (image.width - image.width * matrix[0]) / 2
    , y = (image.height - image.height * matrix[3]) / 2
    , transformedImage = new Image();

  canvas.width = containerWidth;
  canvas.height = containerHeight;
  context.translate(x, y);
  context.transform.apply(context, matrix);
  context.drawImage(image, 0, 0);
  transformedImage.src = canvas.toDataURL('image/png');
  callback(null, transformedImage);
};