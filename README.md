Derby Image Edit
================

A [Derby JS](http://derbyjs.com) component to edit images.
It uses [Derby Panzoom](https://github.com/psirenny/d-panzoom) to edit images.

Features
--------

* Resize and crop images by panning and zooming.
* Display your image in a container smaller than the final image size.
* All of the features in jQuery Panzoom (transitions, etc.)

Installation
------------

    $ npm install d-image-edit --save

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
        <input type="file" as="input">
        <!-- must use hidden/visible classes rather than {{if}} blocks -->
        <div class="{{if !canScale}}hidden{{/if}}">
          <input type="range" as="range">
        </div>
      </div>

Associate the view with the component:

    app.use('photo', require('d-image-edit'));

Use the view:

    <Scripts:>
      <script src="jquery.panzoom.js">

    <Body:>
      <photo contain="invert" on-draw="save()" src="..."></photo>

Elements
--------

**container (Required)** - The element containing the image. The container size must have the same aspect ratio as the final image. It can be smaller in size without sacraficing image quality.

**dropzone** - The region that an image can be dragged and dropped onto.

**image (Required)** - The `<img>` element that should contain the image source.

**input** - The `<input type="file">` element that can select a new image.

**range** - The `<input type="range">` element that can zoom in and out.

Data
----

The following path data is available to the view implementing the component:

**canScale** - True if the computed max scale is greater than the min scale. Use this to conditionally display zoom in and zoom out controls.

**from.data** - The data used to load the image. (File, url, etc.)

**from.image** - The image used to draw the final image.

**to.image** - The final image.

Options
-------

**debounce** - The wait time before a re-draw occurs after a change.

**fileType** - The file type to draw the image as. By default it will use the same file type as the original image.

**size** - The width and height of the final image.

**width** - The width of the final image. Overrides **size**.

**height** - The height of the final image. Overrides **size**.

Functions
---------

**clear()** - Clear all image data.

**dragenter($event)** - Use if you have multiple dropzones that must implement the dragenter event.

**dragover($event)** - Use if you have multiple dropzones that must implement the dragover event.

**drop($event)** - Use if you have multiple dropzones that must implement the drag event.

Events
------

**draw(image)** - Event emitted after a new image is drawn based on changes by panning or zooming.

Other
-----

There are more options, events and functions. See [Derby Panzoom](http://derbyjs.com).

Notes
-----

Be careful about wrapping special elements such as `input` and `range` in `{{if}}` blocks.
If the `{{if}}` block evaluates to false then the server will not render the initial element and it won't be found by the component.
Use `hidden` or `visible` classes to toggle visibility instead.
