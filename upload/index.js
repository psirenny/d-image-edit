var imageUtil = require('./util/image')
  , panzoomUtil = require('./util/panzoom');

function update(model, dom) {
  var file = model.get('image.file')
  if (!file) return;

  imageUtil.create(file, function (err, image) {
    var containerSize = model.get('size')
      , containerHeight = model.get('height') || containerSize
      , containerWidth = model.get('width') || containerSize
      , imageHeight = Math.max(containerHeight, image.height)
      , imageWidth = Math.max(containerWidth, image.width)
      , minScaleX = containerWidth / imageWidth
      , minScaleY = containerHeight / imageHeight
      , minScale = Math.max(minScaleX, minScaleY)
      , maxScale = Math.max(minScale, 1)
      , scale = (minScale + maxScale) / 2
      , zoom = dom.element('zoom');

    imageUtil.resize(image, imageWidth, imageHeight, function (err, image) {
      model.set('image.canScale', maxScale > minScale);
      model.set('image.maxScale', maxScale);
      model.set('image.minScale', minScale);
      model.set('image.src', image.src);

      $('.js-panzoom').panzoom({
        $zoomRange: $(zoom),
        onChange: panzoomUtil.contain(containerWidth, containerHeight, image.width, image.height),
        maxScale: maxScale,
        minScale: minScale
      });

      $('.js-panzoom').panzoom('zoom', scale);
    });
  });
}

exports.create = function (model, dom) {
  var dropzone = dom.element('dropzone')
    , input = dom.element('input');

  function selectFile(file) {
    model.set('image.file', file);
    update(model, dom);
  }

  model.on('change', 'file', function () {
    selectFile(model.get('file'));
  });

  model.on('change', 'height', function () {
    update(model, dom);
  });

  model.on('change', 'size', function () {
    update(model, dom);
  });

  model.on('change', 'width', function () {
    update(model, dom);
  });

  dom.addListener(input, 'change', function (e) {
    selectFile(e.target.files[0]);
  });

  dom.addListener(dropzone, 'dragenter', function (e) {
    e.stopPropagation();
    e.preventDefault();
  });

  dom.addListener(dropzone, 'dragover', function (e) {
    e.stopPropagation();
    e.preventDefault();
  });

  dom.addListener(dropzone, 'drop', function (e) {
    e.stopPropagation();
    e.preventDefault();
    selectFile(e.dataTransfer.files[0]);
  });
};

exports.reset = function () {
  this.model.del('image.file');
  this.model.del('image.src');
};