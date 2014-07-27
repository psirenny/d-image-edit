Derby Image Edit
================

A [Derby JS](http://derbyjs.com) component for editing images.
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

    <edit:>
      <div as="container">
        <img alt="" as="image" src="{{@src}}">
      </div>
      <!-- must use hidden/visible classes rather than {{if}} blocks -->
      <div class="{{if !canScale}}hidden{{/if}}">
        <button on-click="zoom(true)" type="button">Zoom out</button>
        <input type="range" as="range">
        <button on-click="zoom()" type="button">Zoom in</button>
      </div>

Associate the view with the component:

    app.use('edit', require('d-image-edit'));

Use the view:

    <Scripts:>
      <script src="jquery.panzoom.js">

    <Body:>
      <edit contain="invert" on-draw="save()" src="..."></edit>

Elements
--------

**image (Required)** - The `<img>` element that should contain the image source.

**input** - The `<input type="file">` element that can select a new image.

**range** - The `<input type="range">` element that can zoom in and out.

Data
----

The following path data is available to the view implementing the component:

**canScale** - True if the computed max scale is greater than the min scale. Use this to conditionally display zoom in and zoom out controls.

**from.image** - The image used to draw the final image.

**loading** - True while the image is loading.

**to.image** - The final image.

Options
-------

**debounce** - The wait time before a re-draw occurs after a change.

**filetype** - The file type to draw the image as. Defaults to **png**.

**size** - The width and height of the final image.

**width** - The width of the final image. Overrides **size**.

**height** - The height of the final image. Overrides **size**.

Functions
---------

**clear()** - Clear all image data.

Events
------

**clear()** - Event emitted after the image is cleared.

**draw(image)** - Event emitted after a new image is drawn based on changes by panning or zooming.

**load(image)** - Event emitted after the image is loaded.

Other
-----

There are more options, events and functions. See [Derby Panzoom](http://derbyjs.com).

Notes
-----

Be careful about wrapping special elements such as `input` and `range` in `{{if}}` blocks.
If the `{{if}}` block evaluates to false then the server will not render the initial element and it won't be found by the component.
Use `hidden` or `visible` classes to toggle visibility instead.
