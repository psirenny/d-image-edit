Derby Image Upload
==================

A [Derby JS](http://derbyjs.com) component to upload and edit images.
It uses [Derby Panzoom](http://derbyjs.com) to edit images.

Features
--------

* Drag and drop images
* Resize and crop images by panning and zooming
* Display your image in a container smaller than the final image size
* All of the features in jQuery Panzoom (transitions, etc.)

This component does not upload the final image to your server.
Try using [derby-upload](https://github.com/lever/derby-upload) instead.

Installation
------------

    $ npm install d-image-upload --save

Dependencies
------------

This component extends Derby Panzoom which, requires [jQuery Panzoom](https://github.com/timmywil/jquery.panzoom) in order to work.
You must include the script on the page.

Usage
-----

Create a view:

    <photo: element="photo">
      <!-- drag images onto the dropzone to load them -->
      <div as="dropzone">
        <!-- container element for the image -->
        <div as="container">
          <img alt="" as="image" src="{{@src}}">
        </div>
        <!-- select an image -->
        <input type="file" as="input">
        <!-- must use hidden/visible classes rather than {{if}} blocks -->
        <div class="{{if !from.image}}hidden{{/if}}">
          <!-- zoom in or out of the image -->
          <input type="range" as="range">
        </div>
      </div>

Associate the view with the component:

    app.use('photo', require('d-image-upload'));

Use the view:

    <Scripts:>
      <script src="jquery.panzoom.js">

    <Body:>
      <photo contain="invert" draw="doSomething()" src="..."></photo>

Elements
--------

**container** - The element containing the image. The container size must have the same aspect ratio of the final image. It may be smaller than the final image withut sacraficing image quality in the final image.

**dropzone** - The region that an image can be dragged and dropped onto.

**image** - The `<img>` element that should contain the image source.

**input** - The `<input type="file">` element that can select a new image.

**range** - The `<input type="range">` element that can zoom in and out.

Options
-------

**debounce** - The wait time before a re-draw occurs after a change.

**fileType** - The file type to draw the image as. By default it will use the same file type as the uploaded image.

**size** - The width and height of the final image.

**width** - The width of the final image.

**height** - The height of the final image.

Functions
---------

**clear** - Clear all image data.

**dragenter** - Use if you have multiple dropzones that must implement the dragenter event.

**dragover** - Use if you have multiple dropzones that must implement the dragover event.

**drop** - Use if you have multiple dropzones that must implement the drag event.

Events
------

**draw** - Event emitted after a new image is drawn based on changes by panning or zooming.

There are more options, events and functions. See [Derby Panzoom](http://derbyjs.com).
