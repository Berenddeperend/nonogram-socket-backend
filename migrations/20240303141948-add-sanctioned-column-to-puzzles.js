"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Puzzles", "showInOverview", {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: true,
    });

    await queryInterface.addColumn("Puzzles", "sanctioned", {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Puzzles", "showInOverview");
    await queryInterface.removeColumn("Puzzles", "sanctioned");
  },
};
