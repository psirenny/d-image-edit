Derby Image Upload
==================

A [Derby JS](http://derbyjs.com) component library for uploading images.

Installation
------------

    $ npm install d-image-upload --save

Define a view:

    <image-upload:>
      <div as="dropzone">
        <label>Upload</label>
        <input type="file" as="input">
        <img alt="" as="image">
      </div>

Assign it the component:

    app.use('image-upload', require('d-image-upload'));
