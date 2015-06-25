module.exports = {
  up: function(migration, DataTypes) {
    migration.dropAllTables();
    return migration.createTable(
      'nameOfTheNewTable',
      {
          id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
              },
          createdAt: {
                type: DataTypes.DATE
              },
          updatedAt: {
                type: DataTypes.DATE
              },
          attr1: DataTypes.STRING,
          attr2: DataTypes.INTEGER,
          attr3: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false
              }
        },
      {
        engine: 'MYISAM', // default: 'InnoDB'
        charset: 'latin1' // default: null
      }
    )
  }
}
