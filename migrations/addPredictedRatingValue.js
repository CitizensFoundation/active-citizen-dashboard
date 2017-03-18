module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'news_items',
      'predicted_rating_value',
      {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    ).then(function () {
      return queryInterface.addIndex(
        'news_items', [
        'predicted_rating_value'])
    }).then(function () {
      return queryInterface.addIndex(
        'news_items', [
          'rating_value'])
    })
  },

  down: function(queryInterface, Sequelize) {
  // logic for reverting the changes
  }
};
