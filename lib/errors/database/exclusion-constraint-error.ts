import type { DatabaseErrorSubclassOptions } from '../database-error';
import DatabaseError from '../database-error';

interface ExclusionConstraintErrorOptions {
  constraint: string;
  fields: Record<string, string | number>;
  table: string;
}

/**
 * Thrown when an exclusion constraint is violated in the database
 */
class ExclusionConstraintError
  extends DatabaseError
  implements ExclusionConstraintErrorOptions {
  constraint: string;
  fields: Record<string, string | number>;
  table: string;

  constructor(
    options: DatabaseErrorSubclassOptions & ExclusionConstraintErrorOptions,
  ) {
    options = options || {};
    options.parent = options.parent || { sql: '', name: '', message: '' };

    super(options.parent, { stack: options.stack });
    this.message = options.message || options.parent.message || '';
    this.name = 'SequelizeExclusionConstraintError';
    this.constraint = options.constraint;
    this.fields = options.fields;
    this.table = options.table;
  }
}

export default ExclusionConstraintError;
