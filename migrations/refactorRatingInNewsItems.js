module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'news_items',
      'rating_value',
      {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    ).then(function () {
      return queryInterface.addColumn(
        'news_items',
        'rating_category_name',
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      )
    })
  },

  down: function(queryInterface, Sequelize) {
  // logic for reverting the changes
  }
};
