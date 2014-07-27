var debounce = require('debounce');
var Panzoom = require('d-panzoom');

function Component () {};

Component.prototype = Object.create(Panzoom.prototype);

Component.prototype.init = function (model, dom) {
  // set the default panzoom transformation matrix
  model.set('_matrix', [1, 0, 0, 1, 0, 0]);

  // default min scale to the full image
  model.setNull('minScale', 1);

  // ensure the image width is at least as wide as the container
  model.start('from.width', '_containerWidth', 'from.image.width', Math.max);

  // ensure the image height is at least as tall as the container
  model.start('from.height', '_containerHeight', 'from.image.height', Math.max);

  // set the image width to the specified width or size
  // default to the container width
  model.start('to.width', 'size', 'width', '_containerWidth',
    function (imageSize, imageWidth, containerWidth) {
      return imageWidth || imageSize || containerWidth;
    }
  );

  // set the image width to the specified height or size
  // default to the container height
  model.start('to.height', 'size', 'height', '_containerHeight',
    function (imageSize, imageHeight, containerHeight) {
      return imageHeight || imageSize || containerHeight;
    }
  );

  // how much wider the image is relative to the container width
  model.start('_ratioX', 'to.width', '_containerWidth',
    function (imageWidth, containerWidth) {
      return imageWidth / containerWidth;
    }
  );

  // how much taller the image is relative to the container height
  model.start('_ratioY', 'to.height', '_containerHeight',
    function (imageHeight, containerHeight) {
      return imageHeight / containerHeight;
    }
  );

  // the number of times you can scale the container horizontally
  // such that the image will be zoomed in completely
  model.start('_maxScale', 'from.width', '_containerWidth', '_ratioX',
    function (imageWidth, containerWidth, ratioX) {
      return imageWidth / containerWidth / ratioX;
    }
  );

  this.on('change', function (matrix) {
    model.set('_matrix', matrix);
  });

  // whether or not panzoom can scale
  // may be used to determine whether or not to show zoom in, zoom out, etc.
  model.start('canScale', '_maxScale', 'minScale', Math.max);

  Panzoom.prototype.init.call(this, model, dom);
};

Component.prototype.create = function (model, dom) {
  var self = this;

  model.set('_containerWidth', this.container.offsetWidth);
  model.set('_containerHeight', this.container.offsetHeight);

  // draw the image to match the user's zoom/pan preference
  var wait = model.setNull('debounce', 100);
  var draw = debounce(this.draw, wait).bind(this);
  model.on('change', 'filetype', draw);
  model.on('change', 'from.image', draw);
  model.on('change', 'to.width', draw);
  model.on('change', 'to.height', draw);
  model.on('change', '_matrix', draw);

  var edit = this.edit.bind(this);
  model.on('change', 'from.image', edit);
  model.on('change', '_maxScale', edit);

  Panzoom.prototype.create.call(this, model, dom);
};

Component.prototype.clear = function () {
  this.image.src = '';
  this.model.del('from.image');
  this.destroy();
};

Component.prototype.draw = function () {
  var self = this;
  var model = this.model;
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var from = model.get('from.image');
  var maxScale = model.get('_maxScale');
  var matrix = model.get('_matrix');
  var mimetype = 'image/' + model.get('filetype') || 'png';
  var offsetX = .5 * model.get('_containerWidth') * (matrix[0] - 1);
  var offsetY = offsetX * model.get('from.height') / model.get('from.width');
  var translateX = model.get('_ratioX') * (matrix[4] - offsetX);
  var translateY = model.get('_ratioY') * (matrix[5] - offsetY);
  var scaleX = matrix[0] / maxScale;
  var scaleY = matrix[3] / maxScale;
  var to = new Image();
  var toMatrix = [scaleX, 0, 0, scaleY, translateX, translateY];

  if (!from) {
    return model.set('to.image', null);
  }

  to.onload = function () {
    model.set('to.image', to);
    self.emit('draw', to);
  };

  canvas.width = model.get('to.width');
  canvas.height = model.get('to.height');
  ctx.transform.apply(ctx, toMatrix);
  ctx.drawImage(from, 0, 0);
  to.src = canvas.toDataURL(mimetype);
};

Component.prototype.edit = function () {
  var self = this;
  var model = this.model;
  var img = model.get('from.image');
  if (!img) return;

  function onChange(e, ctx, matrix) {
    model.set('_matrix', matrix);
  }

  this.image.onload = function () {
    self.panzoom();
  };

  this.image.src = img.src;
};

Component.prototype.load = function (data) {
  var img = new Image();
  var model = this.model;
  var reader = new FileReader();

  img.onload = function (e) {
    model.set('from.image', img);
  };

  // currently supports only one image
  if (data[0]) data = data[0];

  // data is an image uri
  if (typeof data === 'string') {
    return img.src = data;
  }

  // otherwise data is a file
  reader.onload = function (e) {
    img.src = e.target.result;
  };

  reader.readAsDataURL(data);
}

module.exports = Component;
