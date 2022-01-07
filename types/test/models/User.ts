import {
  AttributesOf,
  BelongsTo,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  DataTypes,
  FindOptions,
  Model,
  ModelStatic,
  Op,
} from 'sequelize';
import { sequelize } from '../connection';

type NonUserAttributes = 'group';
type CreationOptionalAttrs = 'id' | 'createdAt' | 'updatedAt' | 'username' | 'lastName' | 'groupId';

export class User extends Model<
  AttributesOf<User, { omit: NonUserAttributes }>,
  AttributesOf<User, { omit: NonUserAttributes, optional: CreationOptionalAttrs }>
> {
  public static associations: {
    group: BelongsTo<User, UserGroup>;
  };

  declare id: number;
  declare createdAt: Date;
  declare updatedAt: Date;

  declare username: string | null;
  declare firstName: string;
  declare lastName: string | null;
  declare groupId: number | null;

  // mixins for association (optional)
  declare group?: UserGroup;
  declare getGroup: BelongsToGetAssociationMixin<UserGroup>;
  declare setGroup: BelongsToSetAssociationMixin<UserGroup, number>;
  declare createGroup: BelongsToCreateAssociationMixin<UserGroup>;
}

User.init(
  {
    id: {
      type: DataTypes.NUMBER,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: DataTypes.STRING,
    username: DataTypes.STRING,
    groupId: DataTypes.NUMBER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    version: true,
    getterMethods: {
      a() {
        return 1;
      }
    },
    setterMethods: {
      b(val: string) {
        this.username = val;
      }
    },
    scopes: {
      custom(a: number) {
        return {
          where: {
            firstName: a
          }
        };
      },
      custom2() {
        return {};
      }
    },
    indexes: [{
      fields: ['firstName'],
      using: 'BTREE',
      name: 'firstNameIdx',
      concurrently: true
    }],
    sequelize
  }
);

User.afterSync(() => {
  sequelize.getQueryInterface().addIndex(User.tableName, {
    fields: ['lastName'],
    using: 'BTREE',
    name: 'lastNameIdx',
    concurrently: true
  });
});

// Hooks
User.afterFind((users, options) => {
  console.log('found');
});

// TODO: VSCode shows the typing being correctly narrowed but doesn't do it correctly
User.addHook('beforeFind', 'test', (options: FindOptions<AttributesOf<User>>) => {
  return undefined;
});

User.addHook('afterDestroy', async (instance, options) => {
  // `options` from `afterDestroy` should be passable to `sequelize.transaction`
  await instance.sequelize.transaction(options, async () => undefined);
});

// Model#addScope
User.addScope('withoutFirstName', {
  where: {
    firstName: {
      [Op.is]: null
    }
  }
});

User.addScope(
  'withFirstName',
  (firstName: string) => ({
    where: { firstName }
  })
);

// associate
// it is important to import _after_ the model above is already exported so the circular reference works.
import { UserGroup } from './UserGroup';
import { UserPost } from './UserPost';

// associate with a class-based model
export const Group = User.belongsTo(UserGroup, { as: 'group', foreignKey: 'groupId' });
// associate with a sequelize.define model
User.hasMany(UserPost, { as: 'posts', foreignKey: 'userId' });
UserPost.belongsTo(User, {
  foreignKey: 'userId',
  targetKey: 'id',
  as: 'user'
});

// associations refer to their Model
const userType: ModelStatic<User> = User.associations.group.source;
const groupType: ModelStatic<UserGroup> = User.associations.group.target;

// should associate correctly with both sequelize.define and class-based models
User.findOne({ include: [{ model: UserGroup }] });
User.findOne({ include: [{ model: UserPost }] });

User.scope([
  'custom2',
  { method: ['custom', 32] }
]);

const instance = new User({ username: 'foo', firstName: 'bar', lastName: 'baz' });
instance.isSoftDeleted();
