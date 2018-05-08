require('./mongo').connect();

module.exports = {
  heroService: require('./hero.service'),
  villainService: require('./villain.service')
};
