import oracledb from 'oracledb';
import { OracleConfig, ColumnMetadata } from '../../shared/types';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');

let pool: oracledb.Pool | null = null;

export async function initOraclePool(config: OracleConfig): Promise<void> {
  if (pool) {
    await pool.close();
  }

  const connectString = `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${config.host})(PORT=${config.port}))(CONNECT_DATA=(SID=${config.sid})))`;

  pool = await oracledb.createPool({
    user: config.user,
    password: config.password,
    connectString: connectString,
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 1,
    queueTimeout: 60000
  });

  console.log('Oracle connection pool initialized');
}

export async function closeOraclePool(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('Oracle connection pool closed');
  }
}

export async function testConnection(config: OracleConfig): Promise<{ success: boolean; error?: string }> {
  let connection: oracledb.Connection | null = null;
  try {
    const connectString = `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${config.host})(PORT=${config.port}))(CONNECT_DATA=(SID=${config.sid})))`;
    connection = await oracledb.getConnection({
      user: config.user,
      password: config.password,
      connectString: connectString
    });
    await connection.execute('SELECT 1 FROM DUAL');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export async function getTables(schema?: string): Promise<string[]> {
  if (!pool) {
    throw new Error('Oracle connection pool not initialized');
  }

  const connection = await pool.getConnection();
  try {
    let sql = `SELECT table_name FROM user_tables ORDER BY table_name`;
    let binds: any = {};

    if (schema) {
      sql = `SELECT table_name FROM all_tables WHERE owner = :owner ORDER BY table_name`;
      binds = { owner: schema.toUpperCase() };
    }

    const result = await connection.execute(sql, binds);
    return (result.rows || []).map((row: any) => row[0]);
  } finally {
    await connection.close();
  }
}

export async function getTableStructure(tableName: string, schema?: string): Promise<ColumnMetadata[]> {
  if (!pool) {
    throw new Error('Oracle connection pool not initialized');
  }

  const connection = await pool.getConnection();
  try {
    let sql = `
      SELECT 
        c.column_name,
        c.data_type,
        c.nullable,
        c.data_length,
        c.data_precision,
        c.data_scale,
        cc.comments,
        CASE WHEN pk.column_name IS NOT NULL THEN 'YES' ELSE 'NO' END AS is_primary_key
      FROM user_tab_columns c
      LEFT JOIN user_col_comments cc ON c.table_name = cc.table_name AND c.column_name = cc.column_name
      LEFT JOIN (
        SELECT cols.table_name, cols.column_name
        FROM user_constraints cons
        JOIN user_cons_columns cols ON cons.constraint_name = cols.constraint_name
        WHERE cons.constraint_type = 'P'
      ) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
      WHERE c.table_name = :table_name
      ORDER BY c.column_id
    `;
    let binds: any = { table_name: tableName.toUpperCase() };

    if (schema) {
      sql = `
        SELECT 
          c.column_name,
          c.data_type,
          c.nullable,
          c.data_length,
          c.data_precision,
          c.data_scale,
          cc.comments,
          CASE WHEN pk.column_name IS NOT NULL THEN 'YES' ELSE 'NO' END AS is_primary_key
        FROM all_tab_columns c
        LEFT JOIN all_col_comments cc ON c.owner = cc.owner AND c.table_name = cc.table_name AND c.column_name = cc.column_name
        LEFT JOIN (
          SELECT cols.owner, cols.table_name, cols.column_name
          FROM all_constraints cons
          JOIN all_cons_columns cols ON cons.owner = cols.owner AND cons.constraint_name = cols.constraint_name
          WHERE cons.constraint_type = 'P'
        ) pk ON c.owner = pk.owner AND c.table_name = pk.table_name AND c.column_name = pk.column_name
        WHERE c.table_name = :table_name AND c.owner = :owner
        ORDER BY c.column_id
      `;
      binds = { table_name: tableName.toUpperCase(), owner: schema.toUpperCase() };
    }

    const result = await connection.execute(sql, binds);
    return (result.rows || []).map((row: any) => ({
      columnName: row[0],
      dataType: row[1],
      nullable: row[2] === 'Y',
      primaryKey: row[7] === 'YES',
      comment: row[6] || row[0],
      displayName: row[0]
    }));
  } finally {
    await connection.close();
  }
}

export async function executeSql(sql: string): Promise<{ columns: string[]; rows: any[] }> {
  if (!pool) {
    throw new Error('Oracle connection pool not initialized');
  }

  const connection = await pool.getConnection();
  try {
    const result = await connection.execute(sql, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      maxRows: 1000
    });

    const columns = result.metaData ? result.metaData.map((col: any) => col.name) : [];
    const rows = result.rows || [];

    return { columns, rows };
  } finally {
    await connection.close();
  }
}

export async function validateSql(sql: string): Promise<{ valid: boolean; error?: string }> {
  if (!pool) {
    throw new Error('Oracle connection pool not initialized');
  }

  const connection = await pool.getConnection();
  try {
    await connection.execute(`EXPLAIN PLAN FOR ${sql}`);
    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: error.message };
  } finally {
    try {
      await connection.close();
    } catch {}
  }
}

const ORACLE_CONFIG_PATH = path.join(DATA_DIR, 'oracle-config.json');

export async function saveOracleConfig(config: OracleConfig): Promise<void> {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(ORACLE_CONFIG_PATH, JSON.stringify(config, null, 2));
}

export async function loadOracleConfig(): Promise<OracleConfig | null> {
  if (fs.existsSync(ORACLE_CONFIG_PATH)) {
    const content = fs.readFileSync(ORACLE_CONFIG_PATH, 'utf-8');
    return JSON.parse(content);
  }
  return null;
}
