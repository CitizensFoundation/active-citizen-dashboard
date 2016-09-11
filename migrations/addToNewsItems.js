module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'news_items',
      'news_search_query_id',
      {
        type: Sequelize.STRING,
        allowNull: true
      }
    )
  },

  down: function(queryInterface, Sequelize) {
  // logic for reverting the changes
  }
}
