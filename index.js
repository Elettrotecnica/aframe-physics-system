require('./src/components/math');
require('./src/components/body/ammo-body');
require('./src/components/shape/ammo-shape')
require('./src/components/ammo-constraint');
require('./src/system');

module.exports = {
  registerAll: function () {
    console.warn('registerAll() is deprecated. Components are automatically registered.');
  }
};
