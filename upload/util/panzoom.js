exports.contain = function (containerWidth, containerHeight, imageWidth, imageHeight) {
  return function (e, panzoom, transform) {
    var left = (imageWidth - imageWidth * transform[0]) / -2
      , top = (imageHeight - imageHeight * transform[3]) / -2
      , right = left - (transform[0] * imageWidth - containerWidth)
      , bottom = top - (transform[3] * imageHeight - containerHeight)
      , x = transform[4]
      , y = transform[5];

    if (left - transform[4] < 0) x = left;
    if (top - transform[5] < 0) y = top;
    if (right - transform[4] > 0) x = right;
    if (bottom - transform[5] > 0) y = bottom;

    if (x !== transform[4] || y !== transform[5]) {
      panzoom.pan(x, y);
    }
  };
};