module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.addColumn(
      'Users',
      'emailNotify', {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    )
  ]),

  down: (queryInterface) => Promise.all([
    queryInterface.removeColumn('Users', 'emailNotify')
  ])
};