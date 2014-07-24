var debounce = require('debounce');

function Component () {};

Component.prototype.change = function (e) {
  this.selectImage(e.target.files[0]);
};

Component.prototype.clear = function () {
  this.model.del('from.data');
};

Component.prototype.create = function (model, dom) {
  var self = this;

  if (this.dropzone) {
    dom.addListener('dragenter', this.dropzone, this.dragenter.bind(this));
    dom.addListener('dragover', this.dropzone, this.dragover.bind(this));
    dom.addListener('drop', this.dropzone, this.drop.bind(this));
  }

  if (this.input) {
    dom.addListener('change', this.input, this.change.bind(this));
  }

  model.set('_containerWidth', this.container.offsetWidth);
  model.set('_containerHeight', this.container.offsetHeight);

  // load a new image when data changes
  var load = this.load.bind(this);
  model.on('change', 'from.data', load);

  // draw the image to match the user's zoom/pan preference
  var wait = model.setNull('debounce', 100);
  var draw = debounce(this.draw, wait).bind(this);
  model.on('change', 'from.image', draw);
  model.on('change', 'to.width', draw);
  model.on('change', 'to.height', draw);
  model.on('change', '_matrix', draw);

  // run the panzoom jquery script
  var panzoom = this.panzoom.bind(this);
  model.on('change', 'from.image', panzoom);
  model.on('change', '_maxScale', panzoom);

  var opts = [
    'contain',
    'cursor',
    'disablePan',
    'disableZoom',
    'duration',
    'easing',
    'increment',
    'rangeStep',
    'transition'
  ];

  opts.forEach(function (opt) {
    model.on('change', opt, function (val) {
      $(self.image).panzoom('option', opt, val);
    });
  });
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

Component.prototype.draw = function () {
  var model = this.model;
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var from = model.get('from.image');
  var maxScaleX = model.get('_maxScaleX');
  var matrix = model.get('_matrix');
  var offsetX = .5 * model.get('_containerWidth') * (matrix[0] - 1);
  var offsetY = offsetX * model.get('from.height') / model.get('from.width');
  var translateX = model.get('_ratioX') * (matrix[4] - offsetX);
  var translateY = model.get('_ratioY') * (matrix[5] - offsetY);
  var scaleX = matrix[0] / maxScaleX;
  var scaleY = matrix[3] / maxScaleX;
  var to = new Image();
  var toMatrix = [scaleX, 0, 0, scaleY, translateX, translateY];

  if (!from) {
    return model.set('to.image', null);
  }

  to.onload = function () {
    model.set('to.image', to);
  };

  canvas.width = model.get('to.width');
  canvas.height = model.get('to.height');
  ctx.transform.apply(ctx, toMatrix);
  ctx.drawImage(from, 0, 0);
  to.src = canvas.toDataURL(model.get('_mimetype'));
};

Component.prototype.init = function (model) {
  // set the default panzoom transformation matrix
  model.set('_matrix', [1, 0, 0, 1, 0, 0]);

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
  model.start('_maxScaleX', 'from.width', '_containerWidth', '_ratioX',
    function (imageWidth, containerWidth, ratioX) {
      return imageWidth / containerWidth / ratioX;
    }
  );

  // the number of times you can scale the container vertically
  // such that the image will be zoomed in completely
  model.start('_maxScaleY', 'from.height', '_containerHeight', '_ratioY',
    function (imageHeight, containerHeight, ratioY) {
      return imageHeight / containerHeight / ratioY;
    }
  );

  // the maximum amount that panzoom can scale
  model.start('_maxScale', '_maxScaleX', '_maxScaleY', Math.min);

  // the mimetype of the target image
  // defaults to the source image file type
  model.start('_mimetype', 'fileType', 'from.data.type',
    function (fileType, imageType) {
      return fileType ? ('image/' + fileType) : imageType;
    }
  );

  // whether or not panzoom can scale
  // may be used to determine whether or not to show zoom in, zoom out, etc.
  model.start('canScale', '_maxScale', 'minScale', Math.max);
};

Component.prototype.load = function () {
  var self = this;
  var model = this.model;
  var data = model.get('from.data');
  var img = new Image();
  var reader = new FileReader();

  if (!data) {
    this.image.src = '';
    return model.del('from.image');
  }

  img.onload = function (e) {
    model.set('from.image', img);
  };

  if (typeof data === 'string') {
    return img.src = data;
  }

  reader.onload = function (e) {
    img.src = e.target.result;
  };

  reader.readAsDataURL(data);
}

Component.prototype.option = function (name, value) {
  $(this.image).panzoom('option', name, value);
};

Component.prototype.panzoom = function () {
  var self = this;
  var model = this.model;
  var img = model.get('from.image');
  if (!img) return;

  function onChange(e, ctx, matrix) {
    model.set('_matrix', matrix);
  }

  this.image.onload = function () {
    $(self.image).panzoom({
      contain: model.get('contain'),
      cursor: model.get('cursor'),
      disablePan: model.get('disablePan'),
      disableZoom: model.get('disableZoom'),
      duration: model.get('duration'),
      easing: model.get('easing'),
      increment: model.get('increment'),
      maxScale: model.get('_maxScale'),
      minScale: 1,
      onChange: onChange,
      rangeStep: model.get('rangeStep'),
      transition: model.get('transition') !== 'false',
      $zoomRange: $(self.range)
    });
  };

  this.image.src = img.src;
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
