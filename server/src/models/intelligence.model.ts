import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { DetectedSignal, LeadIntelligenceAttributes } from '../types/intelligence.types';

export interface LeadIntelligenceCreationAttributes
  extends Optional<LeadIntelligenceAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class LeadIntelligence
  extends Model<LeadIntelligenceAttributes, LeadIntelligenceCreationAttributes>
  implements LeadIntelligenceAttributes
{
  declare id: string;
  declare lead_id: string;
  declare signals: DetectedSignal[];
  declare why_contact_now: string | null;
  declare why_it_matters: string | null;
  declare conversation_angle: string | null;
  declare suggested_opening: string | null;
  declare created_at: Date;
  declare updated_at: Date;
}

LeadIntelligence.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    lead_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'leads',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    signals: {
      type: DataTypes.JSONB,
      defaultValue: [],
      allowNull: false,
    },
    why_contact_now: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    why_it_matters: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    conversation_angle: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    suggested_opening: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'lead_intelligence',
    timestamps: true,
    underscored: true,
  }
);

export default LeadIntelligence;
