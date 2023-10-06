# Physics for A-Frame VR

A fork of https://github.com/c-frame/aframe-physics-system, focused on the Ammo Driver.

Warning! This fork is maintained for personal use and should not be considered suitable for any purpose. If you find any original code in here to be useful, get in contact with me to open a PR upstream.

Components for A-Frame physics integration.

Supports [Ammo.js](https://github.com/kripken/ammo.js/).

## Contents

+ [Installation](#installation)
+ [Basics](#basics)
+ [Constraints and APIs](#constraints-and-apis)
+ [Driver-specific limitations](#driver-specific-limitations)
+ [Examples](#examples)

## Limitations

See [Driver-specific Limitations](#driver-specific-limitations) below for a list of known driver-specific limitations.

## Installation

Installation instructions vary slightly depending on the driver being used, so see detailed documentation for each driver 

- [Ammo.js](AmmoDriver.md#installation)

  

## Basics

See [Ammo.js](AmmoDriver.md#basics)

The basic concepts are:

- A `physics` component is added to the `<a-scene>`.  The `driver` property of this component indicates which driver to use.  The `debug` property can be set to `true` to get some useful visual hints from the physics engine.  There are also various other driver-specific scene-level settings.
- For physics to apply to an entity, it must be identified as a physics body.
  - In Ammo.js, a physics body each physics body needs two components: `ammo-body` (to define the phsyics properties of the body) and `ammo-shape` (to define its shape).  The `type` property on `ammo-body`is used to specify whether the body is `dynamic`, `kinematic` or `static`
- Dynamic bodies are bodies that are under the control of the physics system (e.g. a ball in a game)
- Static bodies are bodies that influence the movement of other bodies, but are not themselves moved by the physics system (e.g. the walls of a room)
- Kinematic bodies are bodies that can move *and* influence the movement of dynamic bodies, but are not themselves  moved by the physics system.  Players' controllers or hands are often kinematic objects.
- Ammo.js has function to automatically set the shape of a physics body to match the geometry of the entity.  This works a lot of the time, but in some cases, it's necessary to explicitly configure the shape using properties on the relevant components (see driver-specific documentation for details).

For more details, see detailed documentation for each driver 

- [Ammo.js](AmmoDriver.md#components)

## Constraints and APIs

More sophisticated use cases require more than just the configuration of dynamic, static and kinematic bodies.

Both drivers also allow for the configuration of constraints

Constraints such as hinges, springs and so on can be configured between bodies (or between specific points on the surfaces bodies), to provide more sophisticated interactions.   See driver-specific documentation for details.

Both drivers also have APIs that offer

- lifecycle events such as a body initialization, entering a sleeping vs. active state etc.
- collision events that can be used to detect collisions between bodies
- direct interactions with bodies, for example setting their velocity, applying forces to them etc.

See driver-specific documentation for details.

- [Ammo.js](AmmoDriver.md)

  

## Driver-specific limitations

### Ammo.js

- No support for off-center attachment of spring constraints to bodies (integration issue?)

- No support for slider constraint (slider constraint is like a bead on an abacus) (integration issue?) 

## Examples

To help demonstrate the features and capabilities of `aframe-physics-system` a collection of examples have been prepared. Please see the examples folder for a summary and link to each of the prepared examples.



