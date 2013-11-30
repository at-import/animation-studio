Animation Studio
================

A Compass extension for recreating traditional animation techniques with CSS3 animations.

## Table of Contents

1. [Requirements](#requirements)
2. [Installation](#installation)
3. [Animation Sequences](#animation-sequences)
4. [Possible Future Goals](#possible-future-goals)

## Requirements

Animation Studio is a Compass extension, so make sure you have [Sass and Compass Installed](http://compass-style.org/install/) in order to use its awesomeness!

Animation Studio also requires Compass 0.13 (as of this writing, in a stable Alpha stage). Animation studio should install Compass 0.13 for you when you install it, but in case you are getting errors, open up your terminal and type the following in:

`gem install compass --pre`

This will install Compass 0.13. If you are compiling with CodeKit, [Chris Coyier has an awesome writeup](http://css-tricks.com/media-queries-sass-3-2-and-codekit/) on how to get CodeKit playing nice with external gems.

If you are using [Bundler](http://bundler.io/) (and you should be), be sure to include something like the following in your Gemfile:

```ruby
gem 'compass', '>=0.13.alpha.4'
gem 'animation-studio', '~>0.1.1'
```

## Installation

`gem install animation-studio`

#### If creating a new project
`compass create <my_project> -r animation-studio`

#### If adding to existing project, in config.rb
`require 'animation-studio'`

#### Import the toolkit partial at the top of your working file
`@import "animation-studio";`

## Animation Sequences
Using the magic of the `steps()` animation timing function, we can create [walkcycles](http://codepen.io/rachelnabors/pen/bpAJH) [and](http://codepen.io/rachelnabors/full/rCost) [more](http://lessconf.lesseverything.com/index_old.html). But the method requires careful sprite sheet creation and positioning calculations. It does not lend itself to a fast-paced environment or iterative development process. Until now. By leveraging Sass and Compass, we're able to boil down the process to a set of simple mixins.

The first thing you need to do is create a variable set to the folder name your individual sequence images are in. This is the full path relative to your `images` directory. The images in the sprite folder should be named alphabetically in the order you'd like them to appear in the sequence.

```scss
$tuna-walk-cycle: 'tuna-walk';
```

If you plan on reusing the same sequence for multiple selectors, add the following next:

```scss
@include animation-sequence-sprite-generator($tuna-walk-cycle);
```

The first parameter is the sequence folder. Extending is the default behavior. If you'd like to change this behavior for all of your sequences, set `$animation-sequence-extend: false;`

Next, you need to create the keyframes! Doing so is drop dead easy, simply add the following:

```scss
@include animation-sequence-keyframes($tuna-walk-cycle);
```

The first parameter is the sequence folder. By default, the name of the animation will be `'walk-cycle'`. You can pass a string as a second parameter in to `animation-sequence-keyframes` for a different animation name, or you can change the default by changing `$animation-sequence-name: 'my-sequence-name';`

Finally, in the selector you'd like to use the sequence in, simply add the following:

```scss
.tuna {
  @include animation-sequence($tuna-walk-cycle, 1s);
}
```

The first parameter is the sequence folder and the second is the length of the animation. By default, the name of the animation will be `'walk-cycle'`. You can pass a string as a third parameter in to `animation-sequence` for a different animation name, or you can change the default by changing `$animation-sequence-name: 'my-sequence-name';`. If you would not like to extend the selector generated with `animation-sequence-sprite-generator`, you can pass in a fourth parameter `$extend: false`, or if you'd like to change extending behavior globally, you can set `$animation-sequence-extend: false;`

## Update for version 0.1.3

Two new things! Now you can ask Animation Studio not to generate `width` and `height` rules (in case you're, say, using percentages in a responsive design and don't want to have to overwrite pixel-based measurements constantly). By default, this is set to `true`, meaning that setting it to false won't generate those rules. Here's how you do it:

```scss
.tuna {
  @include animation-sequence($tuna-walk-cycle, 1s, false);
  width: 50%; padding-top: 50%
}
```

It's also possible to refer to just a single frame in an animation sprite without knowing the frame's name, just it's number in the sequence:

```scss
.tuna-paused {
  @include animation-still($tuna-walk-cycle, 4);
}
```

This is useful if you want to have an animation paused on just one particular frame.

## Possible Future Goals

* Stacked animations helpers
* [Cut outs](http://codepen.io/rachelnabors/pen/kEeBl) helper
* Show/hide shortcuts
* Scene transitions
* Stage stack managers