exports.create = function (file, callback) {
  var reader = new FileReader();

  reader.onload = function (e) {
    var image = new Image();
    image.src = e.target.result;
    callback(image);
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

  callback(resizedImage);
};