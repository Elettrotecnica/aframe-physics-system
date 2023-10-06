/* global THREE */
var CONSTANTS = require('./constants'),
    C_GRAV = CONSTANTS.GRAVITY,
    C_MAT = CONSTANTS.CONTACT_MATERIAL;

const { TYPE } = require('./constants');
var AmmoDriver = require('./drivers/ammo-driver');
require('aframe-stats-panel')

/**
 * Physics system.
 */
module.exports = AFRAME.registerSystem('physics', {
  schema: {
    driver:                         { default: 'ammo', oneOf: ['ammo'] },
    networkUrl:                     { default: '', if: {driver: 'network'} },

    gravity:                        { default: C_GRAV },
    iterations:                     { default: CONSTANTS.ITERATIONS },
    friction:                       { default: C_MAT.friction },
    restitution:                    { default: C_MAT.restitution },
    contactEquationStiffness:       { default: C_MAT.contactEquationStiffness },
    contactEquationRelaxation:      { default: C_MAT.contactEquationRelaxation },
    frictionEquationStiffness:      { default: C_MAT.frictionEquationStiffness },
    frictionEquationRegularization: { default: C_MAT.frictionEquationRegularization },

    // Never step more than four frames at once. Effectively pauses the scene
    // when out of focus, and prevents weird "jumps" when focus returns.
    maxInterval:                    { default: 4 / 60 },

    // If true, show wireframes around physics bodies.
    debug:                          { default: false },

    // If using ammo, set the default rendering mode for debug
    debugDrawMode: { default: THREE.AmmoDebugConstants.NoDebug },
    // If using ammo, set the max number of steps per frame 
    maxSubSteps: { default: 4 },
    // If using ammo, set the framerate of the simulation
    fixedTimeStep: { default: 1 / 60 },
    // Whether to output stats, and how to output them.  One or more of "console", "events", "panel"
    stats: {type: 'array', default: []}
  },

  /**
   * Initializes the physics system.
   */
  async init() {
    var data = this.data;

    // If true, show wireframes around physics bodies.
    this.debug = data.debug;
    this.initStats();

    this.callbacks = {beforeStep: [], step: [], afterStep: []};

    this.listeners = {};

    this.driver = new AmmoDriver();

    await this.driver.init({
      gravity: data.gravity,
      debugDrawMode: data.debugDrawMode,
      solverIterations: data.iterations,
      maxSubSteps: data.maxSubSteps,
      fixedTimeStep: data.fixedTimeStep
    });

    this.initialized = true;

    if (this.debug) {
      this.setDebug(true);
    }
  },

  initStats() {
    // Data used for performance monitoring.
    this.statsToConsole = this.data.stats.includes("console")
    this.statsToEvents = this.data.stats.includes("events")
    this.statsToPanel = this.data.stats.includes("panel")

    if (this.statsToConsole || this.statsToEvents || this.statsToPanel) {
      this.trackPerf = true;
      this.tickCounter = 0;
      
      this.statsTickData = {};
      this.statsBodyData = {};

      this.countBodies = {
        "ammo": () => this.countBodiesAmmo(),
      }

      this.bodyTypeToStatsPropertyMap = {
        "ammo": {
          [TYPE.STATIC] : "staticBodies",
          [TYPE.KINEMATIC] : "kinematicBodies",
          [TYPE.DYNAMIC] : "dynamicBodies",
        }, 
      }
      
      const scene = this.el.sceneEl;
      scene.setAttribute("stats-collector", `inEvent: physics-tick-data;
                                             properties: before, after, engine, total;
                                             outputFrequency: 100;
                                             outEvent: physics-tick-summary;
                                             outputs: percentile__50, percentile__90, max`);
    }

    if (this.statsToPanel) {
      const scene = this.el.sceneEl;
      const space = "&nbsp&nbsp&nbsp"
    
      scene.setAttribute("stats-panel", "")
      scene.setAttribute("stats-group__bodies", `label: Physics Bodies`)
      scene.setAttribute("stats-row__b1", `group: bodies;
                                           event:physics-body-data;
                                           properties: staticBodies;
                                           label: Static`)
      scene.setAttribute("stats-row__b2", `group: bodies;
                                           event:physics-body-data;
                                           properties: dynamicBodies;
                                           label: Dynamic`)

      scene.setAttribute("stats-row__b3", `group: bodies;
                                             event:physics-body-data;
                                             properties: kinematicBodies;
                                             label: Kinematic`)
      scene.setAttribute("stats-row__b4", `group: bodies;
                                             event: physics-body-data;
                                             properties: manifolds;
                                             label: Manifolds`)
      scene.setAttribute("stats-row__b5", `group: bodies;
                                             event: physics-body-data;
                                             properties: manifoldContacts;
                                             label: Contacts`)
      scene.setAttribute("stats-row__b6", `group: bodies;
                                             event: physics-body-data;
                                             properties: collisions;
                                             label: Collisions`)
      scene.setAttribute("stats-row__b7", `group: bodies;
                                             event: physics-body-data;
                                             properties: collisionKeys;
                                             label: Coll Keys`)

      scene.setAttribute("stats-group__tick", `label: Physics Ticks: Median${space}90th%${space}99th%`)
      scene.setAttribute("stats-row__1", `group: tick;
                                          event:physics-tick-summary;
                                          properties: before.percentile__50, 
                                                      before.percentile__90, 
                                                      before.max;
                                          label: Before`)
      scene.setAttribute("stats-row__2", `group: tick;
                                          event:physics-tick-summary;
                                          properties: after.percentile__50, 
                                                      after.percentile__90, 
                                                      after.max; 
                                          label: After`)
      scene.setAttribute("stats-row__3", `group: tick; 
                                          event:physics-tick-summary; 
                                          properties: engine.percentile__50, 
                                                      engine.percentile__90, 
                                                      engine.max;
                                          label: Engine`)
      scene.setAttribute("stats-row__4", `group: tick;
                                          event:physics-tick-summary;
                                          properties: total.percentile__50, 
                                                      total.percentile__90, 
                                                      total.max;
                                          label: Total`)
    }
  },

  /**
   * Updates the physics world on each tick of the A-Frame scene. It would be
   * entirely possible to separate the two – updating physics more or less
   * frequently than the scene – if greater precision or performance were
   * necessary.
   * @param  {number} t
   * @param  {number} dt
   */
  tick: function (t, dt) {
    if (!this.initialized || !dt) return;

    const beforeStartTime = performance.now();

    var i;
    var callbacks = this.callbacks;

    for (i = 0; i < this.callbacks.beforeStep.length; i++) {
      this.callbacks.beforeStep[i].beforeStep(t, dt);
    }

    const engineStartTime = performance.now();

    this.driver.step(Math.min(dt / 1000, this.data.maxInterval));

    const engineEndTime = performance.now();

    for (i = 0; i < callbacks.step.length; i++) {
      callbacks.step[i].step(t, dt);
    }

    for (i = 0; i < callbacks.afterStep.length; i++) {
      callbacks.afterStep[i].afterStep(t, dt);
    }

    if (this.trackPerf) {
      const afterEndTime = performance.now();

      this.statsTickData.before = engineStartTime - beforeStartTime
      this.statsTickData.engine = engineEndTime - engineStartTime
      this.statsTickData.after = afterEndTime - engineEndTime
      this.statsTickData.total = afterEndTime - beforeStartTime

      this.el.emit("physics-tick-data", this.statsTickData)

      this.tickCounter++;

      if (this.tickCounter === 100) {

        this.countBodies[this.data.driver]()

        if (this.statsToConsole) {
          console.log("Physics body stats:", this.statsBodyData)
        }

        if (this.statsToEvents  || this.statsToPanel) {
          this.el.emit("physics-body-data", this.statsBodyData)
        }
        this.tickCounter = 0;
      }
    }
  },

  countBodiesAmmo() {

    const statsData = this.statsBodyData
    statsData.manifolds = this.driver.dispatcher.getNumManifolds();
    statsData.manifoldContacts = 0;
    for (let i = 0; i < statsData.manifolds; i++) {
      const manifold = this.driver.dispatcher.getManifoldByIndexInternal(i);
      statsData.manifoldContacts += manifold.getNumContacts();
    }
    statsData.collisions = this.driver.collisions.size;
    statsData.collisionKeys = this.driver.collisionKeys.length;
    statsData.staticBodies = 0
    statsData.kinematicBodies = 0
    statsData.dynamicBodies = 0
    
    function type(el) {
      return el.components['ammo-body'].data.type
    }

    this.driver.els.forEach((el) => {
      const property = this.bodyTypeToStatsPropertyMap["ammo"][type(el)]
      statsData[property]++
    })
  },

  setDebug: function(debug) {
    this.debug = debug;
    if (this.data.driver === 'ammo' && this.initialized) {
      if (debug && !this.debugDrawer) {
        this.debugDrawer = this.driver.getDebugDrawer(this.el.object3D);
        this.debugDrawer.enable();
      } else if (this.debugDrawer) {
        this.debugDrawer.disable();
        this.debugDrawer = null;
      }
    }
  },

  /**
   * Adds a body to the scene, and binds proxied methods to the driver.
   */
  addBody: function (body, group, mask) {
    var driver = this.driver;

    this.driver.addBody(body, group, mask);
  },

  /**
   * Removes a body and its proxied methods.
   */
  removeBody: function (body) {
    this.driver.removeBody(body);
  },

  /** @param {Ammo.btTypedConstraint} constraint */
  addConstraint: function (constraint) {
    this.driver.addConstraint(constraint);
  },

  /** @param {Ammo.btTypedConstraint} constraint */
  removeConstraint: function (constraint) {
    this.driver.removeConstraint(constraint);
  },

  /**
   * Adds a component instance to the system and schedules its update methods to be called
   * the given phase.
   * @param {Component} component
   * @param {string} phase
   */
  addComponent: function (component) {
    var callbacks = this.callbacks;
    if (component.beforeStep) callbacks.beforeStep.push(component);
    if (component.step)       callbacks.step.push(component);
    if (component.afterStep)  callbacks.afterStep.push(component);
  },

  /**
   * Removes a component instance from the system.
   * @param {Component} component
   * @param {string} phase
   */
  removeComponent: function (component) {
    var callbacks = this.callbacks;
    if (component.beforeStep) {
      callbacks.beforeStep.splice(callbacks.beforeStep.indexOf(component), 1);
    }
    if (component.step) {
      callbacks.step.splice(callbacks.step.indexOf(component), 1);
    }
    if (component.afterStep) {
      callbacks.afterStep.splice(callbacks.afterStep.indexOf(component), 1);
    }
  },

  /** @return {Array<object>} */
  getContacts: function () {
    return this.driver.getContacts();
  },

  getMaterial: function (name) {
    return this.driver.getMaterial(name);
  }
});
