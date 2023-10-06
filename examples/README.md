# Examples

To help demonstrate the features and capabilities of `aframe-physics-system`
the following collection of examples have been prepared.

Examples marked "Broken" do not currently function as expected, due to open bugs.
Examples marked "Limited" have limitations in terms of what function can be exercised (e.g. due to constraints on mouse interaction, or limitations with particular driver implementations)

| Example                                                      | Ammo                                     |
| ------------------------------------------------------------ | ---------------------------------------- |
| Demonstration of many features in a single example.          | [**OK**](ammo/sandbox.html)         |
| Construct a [compound shape](../README.md#shape) and simulate collision with a ground plane. | [**OK**](ammo/compound.html) |
| Demonstration of many constraints including cone twist, hinge, lock, point to point, slider (Ammo only). | [**OK**](ammo/constraints.html) |
| Bounce simulation with [restitution (bounciness)](../README.md#system-configuration) of 1. | [**OK**](ammo/materials.html) |
| Four vertical [springs](../README.md#spring) each between two boxes with an assortment of damping and stiffness values | [**Limited**](ammo/spring.html) |
| Apply [strong impulse](../README.md#using-the-cannonjs-api) to a cube when the user clicks with a mouse. Cubes are arranged in four 4x3 walls. | [**OK**](ammo/stress.html) |
| Animate a long wall moving along the z-axis along the initial view direction. | [**OK**](ammo/sweeper.html) |
| Remove a [dynamic body](../README.md#dynamic-body-and-static-body) from the scene after 100 frames | [**OK**](ammo/ttl.html) |
| Performance test: 100 balls rolling down a peg board, with timing data from physics engine. | [**OK**](ammo/perf.html) |

