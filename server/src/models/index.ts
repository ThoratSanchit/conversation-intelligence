import Lead from './lead.model';
import LeadIntelligence from './intelligence.model';
import sequelize from '../config/database';

// Strict 1:1 association
Lead.hasOne(LeadIntelligence, {
  foreignKey: 'lead_id',
  as: 'intelligence',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

LeadIntelligence.belongsTo(Lead, {
  foreignKey: 'lead_id',
  as: 'lead',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

export { Lead, LeadIntelligence, sequelize };

export async function syncDatabase(options = { alter: true }): Promise<void> {
  await sequelize.sync(options);
  console.log('Database models synchronized successfully.');
}

export default {
  Lead,
  LeadIntelligence,
  sequelize,
  syncDatabase,
};
