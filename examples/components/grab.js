AFRAME.registerComponent('grab', {
  init: function () {
    this.system = this.el.sceneEl.systems.physics;

    this.GRABBED_STATE = 'grabbed';

    this.grabbing = false;
    this.hitEl =      /** @type {AFRAME.Element}    */ null;
    this.physics =    /** @type {AFRAME.System}     */ this.el.sceneEl.systems.physics;
    this.constraint = /** @type {Ammo.Constraint} */ null;

    // Bind event handlers
    this.onHitAmmo = this.onHitAmmo.bind(this);
    this.onGripOpen = this.onGripOpen.bind(this);
    this.onGripClose = this.onGripClose.bind(this);

    this.driver = "ammo"
  },

  play: function () {
    var el = this.el;
    el.addEventListener('collidestart', this.onHitAmmo);
    el.addEventListener('gripdown', this.onGripClose);
    el.addEventListener('gripup', this.onGripOpen);
    el.addEventListener('trackpaddown', this.onGripClose);
    el.addEventListener('trackpadup', this.onGripOpen);
    el.addEventListener('triggerdown', this.onGripClose);
    el.addEventListener('triggerup', this.onGripOpen);
  },

  pause: function () {
    var el = this.el;
    el.removeEventListener('collidestart', this.onHitAmmo);
    el.removeEventListener('gripdown', this.onGripClose);
    el.removeEventListener('gripup', this.onGripOpen);
    el.removeEventListener('trackpaddown', this.onGripClose);
    el.removeEventListener('trackpadup', this.onGripOpen);
    el.removeEventListener('triggerdown', this.onGripClose);
    el.removeEventListener('triggerup', this.onGripOpen);
  },

  onGripClose: function (evt) {
    this.grabbing = true;
  },

  onGripOpen: function (evt) {
    var hitEl = this.hitEl;
    this.grabbing = false;
    if (!hitEl) { return; }
    hitEl.removeState(this.GRABBED_STATE);

    this.hitEl.removeAttribute(`ammo-constraint__${this.el.id}`)

    this.hitEl = undefined;
    
  },

  onHitAmmo: function (evt) {
    var hitEl = evt.detail.targetEl;
    // If the element is already grabbed (it could be grabbed by another controller).
    // If the hand is not grabbing the element does not stick.
    // If we're already grabbing something you can't grab again.
    if (!hitEl || hitEl.is(this.GRABBED_STATE) || !this.grabbing || this.hitEl) { return; }
    hitEl.addState(this.GRABBED_STATE);
    this.hitEl = hitEl;
    this.hitEl.setAttribute(`ammo-constraint__${this.el.id}`,
                            { target: `#${this.el.id}` })    
  }
});
