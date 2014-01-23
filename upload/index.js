var _ = require('lodash')
  , imageUtil = require('./util/image')
  , panzoomUtil = require('./util/panzoom');

exports.create = function (model, dom) {
  var dropzone = dom.element('dropzone')
    , input = dom.element('input');

  function selectImage(file) {
    model.set('image.data', file);
    update(model, dom);
  }

  model.on('change', 'height', function () {
    update(model, dom);
  });

  model.on('change', 'image.scale', function (scale, prev, passed) {
    if (passed.ignore) return;
    $('.js-panzoom').panzoom('zoom', parseFloat(scale));
  });

  model.on('change', 'image.transform', function (matrix, prev, passed) {
    edit(model, dom);
  });

  model.on('change', 'size', function () {
    update(model, dom);
  });

  model.on('change', 'width', function () {
    update(model, dom);
  });

  dom.addListener(input, 'change', function (e) {
    selectImage(e.target.files[0]);
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
    var file = e.dataTransfer.files[0];
    var url = e.dataTransfer.getData('text');
    selectImage(file || url);
  });
};

function edit(model, dom) {
  var containerSize = model.get('size')
    , containerHeight = model.get('height') || containerSize
    , containerWidth = model.get('width') || containerSize
    , image = model.get('image.object')
    , matrix = model.get('image.transform');

  imageUtil.transform(image, matrix, containerWidth, containerHeight,
    function (err, image) {
      imageUtil.toBlob(image, function (err, blob) {
        model.set('image.edited.blob', blob);
        model.set('image.edited.object', image);
      })
    }
  );
}

function update(model, dom) {
  var data = model.get('image.data');
  if (!data) return;

  imageUtil.create(data, function (err, image) {
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
      model.set('image.object', image);
      var contain = panzoomUtil.contain(containerWidth, containerHeight, imageWidth, imageHeight);

      var transform = _.debounce(function (matrix) {
        model.pass({ignore: true}).set('image.scale', matrix[0]);
        model.set('image.transform', matrix);
      }, 100);

      $('.js-panzoom').panzoom({
        $zoomRange: $(zoom),
        contain: 'invert',
        onChange: function (e, panzoom, matrix) {
          contain(e, panzoom, matrix);
          transform(matrix);
        },
        maxScale: maxScale,
        minScale: minScale
      });

      $('.js-panzoom').panzoom('zoom', scale);
    });
  });
}