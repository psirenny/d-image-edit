var debounce = require('debounce');

function Component () {};

Component.prototype.change = function (e) {
  this.selectImage(e.target.files[0]);
};

Component.prototype.clear = function () {
  this.model.del('from.data');
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

Component.prototype.edit = function () {
  var model = this.model;
  var boundWidth = model.get('dim.boundWidth');
  var boundHeight = model.get('dim.boundHeight');
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var from = model.get('from.image');
  var fromWidth = model.get('dim.fromWidth');
  var fromHeight = model.get('dim.fromHeight');
  var maxScale = model.get('dim.maxScale');
  var matrix = model.get('dim.matrix');
  var ratioX = model.get('dim.ratioX');
  var ratioY = model.get('dim.ratioY');
  var offsetX = .5 * boundWidth * (matrix[0] - 1);
  var offsetY = .5 * boundHeight * (matrix[3] - 1);
  var originX = offsetX * Math.max(1, fromWidth / fromHeight);
  var originY = offsetY * Math.max(1, fromHeight / fromWidth);
  var translateX = ratioX * (matrix[4] - originX);
  var translateY = ratioY * (matrix[5] - originY);
  var scaleX = matrix[0] / maxScale;
  var scaleY = matrix[3] / maxScale;
  var to = new Image();
  var toWidth = model.get('dim.toWidth');
  var toHeight = model.get('dim.toHeight');
  var toMatrix = [scaleX, 0, 0, scaleY, translateX, translateY];

  if (!from) {
    return model.set('to.image', null);
  }

  to.onload = function () {
    model.set('to.image', to);
  };

  canvas.width = toWidth;
  canvas.height = toHeight;
  ctx.transform.apply(ctx, toMatrix);
  ctx.drawImage(from, 0, 0);
  to.src = canvas.toDataURL('image/png');
};

Component.prototype.init = function (model) {
  var div = function (a, b, c) { return a / b / (c || 1); };
  var edit = debounce(this.edit, 100).bind(this);
  var gt = function (a, b) { return a > b; };
  var load = this.load.bind(this);
  var or = function (a, b, c) { return a || b || c };
  var offset = function (scale, dim) { return -scale * dim; };
  var matrix = function (scale, offsetX, offsetY) { return [scale, 0, 0, scale, offsetX, offsetY]; };
  var panzoom = debounce(this.panzoom, 100).bind(this);
  model.set('dim.matrix', [1, 0, 0, 1, 0, 0]);
  model.start('dim.boundWidth', 'containerWidth', 'containerSize', 'dim.containerWidth', or);
  model.start('dim.boundHeight', 'containerHeight', 'containerSize', 'dim.containerHeight', or);
  model.start('dim.canScale', 'dim.maxScale', 'dim.minScale', gt);
  model.start('dim.fromWidth', 'dim.boundWidth', 'from.image.width', Math.max);
  model.start('dim.fromHeight', 'dim.boundHeight', 'from.image.height', Math.max);
  model.start('dim.toWidth', 'size', 'width', or);
  model.start('dim.toHeight', 'size', 'height', or);
  model.start('dim.ratioX', 'dim.toWidth', 'dim.boundWidth', div);
  model.start('dim.ratioY', 'dim.toHeight', 'dim.boundHeight', div);
  model.start('dim.ratio', 'dim.ratioX', 'dim.ratioY', Math.max);
  model.start('dim.maxScaleX', 'dim.fromWidth', 'dim.boundWidth', 'dim.ratioX', div);
  model.start('dim.maxScaleY', 'dim.fromHeight', 'dim.boundHeight', 'dim.ratioY', div);
  model.start('dim.maxScale', 'dim.maxScaleX', 'dim.maxScaleY', Math.min);
  model.start('dim.offsetX', 'dim.maxScale', 'dim.toWidth', offset);
  model.start('dim.offsetY', 'dim.maxScale', 'dim.toHeight', offset);
  model.on('change', 'from.data', load);
  model.on('change', 'dim.boundWidth', edit);
  model.on('change', 'dim.boundHeight', edit);
  model.on('change', 'dim.toWidth', edit);
  model.on('change', 'dim.toHeight', edit);
  model.on('change', 'dim.matrix', edit);
  model.on('change', 'from.image', edit);
  model.on('change', 'dim.maxScale', panzoom);
  model.on('change', 'dim.minScale', panzoom);
  model.on('change', 'from.image', panzoom);
};

Component.prototype.load = function () {
  var self = this;
  var model = this.model;
  var data = model.get('from.data');
  var image = new Image();
  var reader = new FileReader();

  if (!data) {
    self.image.src = '';
    return model.del('from.image');
  }

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

Component.prototype.panzoom = function () {
  var self = this;
  var model = this.model;
  var contain = model.get('contain') || 'invert';
  var image = model.get('from.image');
  var maxScale = model.get('dim.maxScale');
  if (!image) return;

  function onChange(e, ctx, matrix) {
    model.set('dim.matrix', matrix);
  }

  this.image.onload = function () {
    $(self.image).panzoom({
      contain: model.get('contain'),
      easing: model.get('easing'),
      maxScale: maxScale,
      minScale: 1,
      onChange: onChange,
      $zoomRange: $(self.range)
    });
  };

  this.image.src = image.src;
};

Component.prototype.reset = function (options) {
  $(this.image).panzoom('reset', options);
};

Component.prototype.resetPan = function (options) {
  $(this.image).panzoom('resetPan', options);
};

Component.prototype.resetZoom = function (options) {
  $(this.image).panzoom('resetZoom', options);
};

Component.prototype.selectImage = function (data) {
  this.model.set('from.data', data);
};

Component.prototype.zoom = function (scale, opts) {
  $(this.image).panzoom('zoom', scale, opts);
};

Component.prototype.zoomIn = function () {
  $(this.image).panzoom('zoom');
};

Component.prototype.zoomOut = function () {
  $(this.image).panzoom('zoom', true);
};

module.exports = Component;
