module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'news_items',
      'duplicate',
      {
        type: Sequelize.BOOLEAN,
        default: false
      }
    )
  },

  down: function(queryInterface, Sequelize) {
  // logic for reverting the changes
  }
};
