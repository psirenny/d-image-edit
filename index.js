var debounce = require('debounce');
var util = require('./util');

function Component () {};

Component.prototype.change = function (e) {
  this.selectImage(e.target.files[0]);
};

Component.prototype.dragenter = function (e) {
  e.stopPropagation();
  e.preventDefault();
};

Component.prototype.dragover = function (e) {
  e.stopPropagation();
  e.preventDefault();
};

Component.prototype.drop = function (e) {
  e.stopPropagation();
  e.preventDefault();
  var data = e.dataTransfer.getData('text');
  var file = e.dataTransfer.files[0];
  this.selectImage(file || data);
};

Component.prototype.selectImage = function (data) {
  this.model.set('from.data', data);
  this.load(this.model, this.dom);
};

Component.prototype.init = function (model) {
  var blob = this.blob.bind(this);
  var div = function (a, b) { return a / b; };
  var edit = debounce(this.edit, 100).bind(this);
  var gt = function (a, b) { return a > b; };
  var or = function (a, b, c) { return a || b || c };
  var offset = function (scale, dim) { return -scale * dim; };
  var matrix = function (scale, offsetX, offsetY) { return [scale, 0, 0, scale, offsetX, offsetY]; };
  var panzoom = debounce(this.panzoom, 100).bind(this);
  model.start('dim.boundWidth', 'containerWidth', 'containerSize', 'dim.containerWidth', or);
  model.start('dim.boundHeight', 'containerHeight', 'containerSize', 'dim.containerHeight', or);
  model.start('dim.canScale', 'dim.maxScale', 'dim.minScale', gt);
  model.start('dim.fromWidth', 'dim.boundWidth', 'from.image.width', Math.max);
  model.start('dim.fromHeight', 'dim.boundHeight', 'from.image.height', Math.max);
  model.start('dim.toWidth', 'size', 'width', or);
  model.start('dim.toHeight', 'size', 'height', or);
  model.start('dim.minScaleX', 'dim.boundWidth', 'dim.fromWidth', div);
  model.start('dim.minScaleY', 'dim.boundHeight', 'dim.fromHeight', div);
  model.start('dim.minScale', 'dim.minScaleX', 'dim.minScaleY', Math.max);
  model.start('dim.maxScaleX', 'dim.boundWidth', 'dim.toWidth', div);
  model.start('dim.maxScaleY', 'dim.boundHeight', 'dim.toHeight', div);
  model.start('dim.maxScale', 'dim.maxScaleX', 'dim.maxScaleY', Math.max);
  model.start('dim.offsetX', 'dim.maxScale', 'dim.toWidth', offset);
  model.start('dim.offsetY', 'dim.maxScale', 'dim.toHeight', offset);
  model.start('dim.matrix', 'dim.maxScale', 'dim.offsetX', 'dim.offsetY', matrix);
  model.on('change', 'dim.boundWidth', edit);
  model.on('change', 'dim.boundHeight', edit);
  model.on('change', 'dim.matrix', edit);
  model.on('change', 'dim.toWidth', edit);
  model.on('change', 'dim.toHeight', edit);
  model.on('change', 'from.image', edit);
  model.on('change', 'to.image', blob);
  model.on('change', 'dim.maxScale', panzoom);
  model.on('change', 'dim.minScale', panzoom);
  model.on('change', 'dim.matrix', panzoom);
  model.on('change', 'to.image', panzoom);
};

Component.prototype.create = function (model, dom) {
  if (this.dropzone) {
    dom.addListener('dragenter', this.dropzone, this.dragenter.bind(this));
    dom.addListener('dragover', this.dropzone, this.dragover.bind(this));
    dom.addListener('drop', this.dropzone, this.drop.bind(this));
  }

  if (this.input) {
    dom.addListener('change', this.input, this.change.bind(this));
  }

  model.set('dim.containerWidth', this.container.offsetWidth);
  model.set('dim.containerHeight', this.container.offsetWidth);
};

Component.prototype.reset = function () {
  $(this.image).panzoom('reset');
};

Component.prototype.blob = function () {
  var model = this.model;
  var image = model.get('from.image');
  if (!image) return model.set('to.blob', null);

  util.toBlob(image, function (err, blob) {
    if (err) return;
    model.set('to.blob', blob);
  });
};

Component.prototype.edit = function () {
  var model = this.model;
  var boundWidth = model.get('dim.boundWidth');
  var boundHeight = model.get('dim.boundHeight');
  var image = model.get('from.image');
  var matrix = model.get('dim.matrix');
  var toWidth = model.get('dim.toWidth');
  var toHeight = model.get('dim.toHeight');
  if (!image) return model.set('to.image', null);

  util.transform(image, matrix, boundWidth, boundHeight, toWidth, toHeight,
    function (err, image) {
      if (err) return;
      model.set('to.image', image);
    }
  );
};

Component.prototype.panzoom = function () {
  var model = this.model;
  var image = model.get('to.image');
  var maxScale = model.get('dim.maxScale');
  var minScale = model.get('dim.minScale');
  var matrix = model.get('dim.matrix');
  matrix = 'matrix(' + matrix.join(',') + ')';
  if (!image) return;

  this.image.onload = function () {
    $(self.image).panzoom({
      contain: 'invert',
      maxScale: maxScale,
      minScale: minScale,
      startTransform: matrix
    });
  };

  console.log(model.get('from.image.src'));
  console.log(model.get('to.image.src'));
  this.image.src = image.src;
};

Component.prototype.load = function () {
  var model = this.model;
  var data = model.get('from.data');
  var image = new Image();
  var reader = new FileReader();
  if (!data) return;

  image.onload = function (e) {
    model.set('from.image', image);
  };

  if (typeof data === 'string') {
    return image.src = data;
  }

  reader.onload = function (e) {
    image.src = e.target.result;
  };

  reader.readAsDataURL(data);
}

module.exports = Component;
