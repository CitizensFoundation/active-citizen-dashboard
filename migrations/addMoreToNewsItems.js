module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'news_items',
      'translated_text',
      {
        type: Sequelize.TEXT,
        allowNull: true
      }
    ).then(function () {
      return queryInterface.addColumn(
        'news_items',
        'language',
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
