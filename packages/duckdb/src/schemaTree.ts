import {getDuckDbTypeCategory} from './typeCategories';
import {DbSchemaNode, DataTable} from './types';

/**
 * Group tables by database, schema and create a tree of databases, schemas, tables, and columns.
 * @param tables - The tables to group
 * @returns An array of database nodes containing schemas, tables and columns
 */
export function createDbSchemaTrees(tables: DataTable[]): DbSchemaNode[] {
  const databaseMap = new Map<string, Map<string, DbSchemaNode[]>>();

  for (const table of tables) {
    const database = table.database ?? 'default';
    const schema = table.schema;
    const tableName = table.tableName;

    const columnNodes = table.columns.map((column) =>
      createColumnNode(schema, tableName, column.name, column.type),
    );

    const tableNode = createTableNode(database, schema, tableName, columnNodes);

    if (!databaseMap.has(database)) {
      databaseMap.set(database, new Map<string, DbSchemaNode[]>());
    }

    const schemaMap = databaseMap.get(database)!;

    if (!schemaMap.has(schema)) {
      schemaMap.set(schema, []);
    }

    schemaMap.get(schema)?.push(tableNode);
  }

  // Create database nodes
  return Array.from(databaseMap.entries()).map(([database, schemaMap]) => {
    const schemaNodes = Array.from(schemaMap.entries()).map(
      ([schema, tables]) => createSchemaTreeNode(schema, tables),
    );

    return createDatabaseTreeNode(database, schemaNodes);
  });
}

function createColumnNode(
  schema: string,
  tableName: string,
  columnName: string,
  columnType: string,
): DbSchemaNode {
  return {
    key: `${schema}.${tableName}.${columnName}`,
    object: {
      type: 'column',
      name: columnName,
      columnType,
      columnTypeCategory: getDuckDbTypeCategory(columnType),
    },
  };
}

function createTableNode(
  database: string,
  schema: string,
  tableName: string,
  columnNodes: DbSchemaNode[],
): DbSchemaNode {
  return {
    key: `${schema}.${tableName}`,
    object: {
      type: 'table',
      schema,
      database,
      name: tableName,
    },
    isInitialOpen: false,
    children: columnNodes,
  };
}

function createSchemaTreeNode(
  schema: string,
  tables: DbSchemaNode[],
): DbSchemaNode {
  return {
    key: schema,
    object: {
      type: 'schema',
      name: schema,
    },
    isInitialOpen: true,
    children: tables,
  };
}

function createDatabaseTreeNode(
  database: string,
  schemas: DbSchemaNode[],
): DbSchemaNode {
  return {
    key: database,
    object: {
      type: 'database',
      name: database,
    },
    isInitialOpen: true,
    children: schemas,
  };
}
