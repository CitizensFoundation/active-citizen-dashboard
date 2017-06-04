var async = require("async");
var log = require('../utils/logger');
var toJson = require('../utils/to_json');

"use strict";

module.exports = function(sequelize, DataTypes) {
  var NewsItem = sequelize.define("NewsItem", {
    name: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    rating:  DataTypes.JSONB,
    data_object:  DataTypes.JSONB,
    data_id: DataTypes.STRING,
    translated_text: DataTypes.TEXT,
    rating_value: DataTypes.INTEGER,
    predicted_rating_value: DataTypes.INTEGER,
    rating_category_name: DataTypes.STRING,
    language: DataTypes.STRING,
    news_search_query_id: DataTypes.STRING,
    ip_address: DataTypes.STRING
  }, {

    underscored: true,

    tableName: 'news_items',

    instanceMethods: {
    },

    classMethods: {

      associate: function(models) {
        NewsItem.belongsTo(models.NewsSearchQuery);
      },
      
      getSearchVector: function() {
        return 'NewsItemText';
      },

      addFullTextIndex: function() {
        if(sequelize.options.dialect !== 'postgres') {
          console.log('Not creating search index, must be using POSTGRES to do this');
          return;
        }

        console.log("Adding full text index");

        var searchFields = ['name', 'translated_text', 'description'];

        var NewsItem = this;

        var vectorName = NewsItem.getSearchVector();

        sequelize
          .query('ALTER TABLE "' + NewsItem.tableName + '" ADD COLUMN "' + vectorName + '" TSVECTOR')
          .then(function() {
            return sequelize
              .query('UPDATE "' + NewsItem.tableName + '" SET "' + vectorName + '" = to_tsvector(\'english\', ' + searchFields.join(' || \' \' || ') + ')')
              .error(console.log);
          }).then(function() {
          return sequelize
            .query('CREATE INDEX news_item_search_idx ON "' + NewsItem.tableName + '" USING gin("' + vectorName + '");')
            .error(console.log);
        }).then(function() {
          return sequelize
            .query('CREATE TRIGGER news_item_vector_update BEFORE INSERT OR UPDATE ON "' + NewsItem.tableName + '" FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger("' + vectorName + '", \'pg_catalog.english\', ' + searchFields.join(', ') + ')')
            .error(console.log);
        }).error(console.log);

      },

      search: function(query) {
        console.log("In search for " + query);

        if(sequelize.options.dialect !== 'postgres') {
          console.log('Search is only implemented on POSTGRES database');
          return;
        }

        var NewsItem = this;

        query = sequelize.getQueryInterface().escape(query);
        console.log(query);

        var where = '"'+NewsItem.getSearchVector() + '" @@ plainto_tsquery(\'english\', ' + query + ')';

        return NewsItem.findAll({
          order: "created_at DESC",
          where: [where, [{
            $and: {
              predicted_rating_value: {
                $gt: 0
              },
              rating_value: null
            }
          }]],
          limit: 1500
        });
      }
    }
  });
  return NewsItem;
};