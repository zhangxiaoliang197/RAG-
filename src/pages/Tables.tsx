import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, RefreshCw, Database, Eye } from 'lucide-react';
import { api } from '../services/api';
import type { OracleConfig, TableMetadata, CreateTableMetadataRequest, ColumnMetadata, TableRelationship } from '../../shared/types';

export function Tables() {
  const [tables, setTables] = useState<TableMetadata[]>([]);
  const [oracleConfig, setOracleConfig] = useState<OracleConfig | null>(null);
  const [remoteTables, setRemoteTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [configForm, setConfigForm] = useState<OracleConfig>({
    user: '',
    password: '',
    host: '',
    port: 1521,
    sid: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState<TableMetadata | null>(null);
  const [tableForm, setTableForm] = useState<CreateTableMetadataRequest>({
    tableName: '',
    displayName: '',
    tableComment: '',
    schema: '',
    columns: [],
    relationships: [],
  });
  const [selectedRemoteTable, setSelectedRemoteTable] = useState<string>('');
  const [schemaInput, setSchemaInput] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [tablesRes, configRes] = await Promise.all([
        api.oracle.getAllTables(),
        api.oracle.getConfig(),
      ]);
      if (tablesRes.success) setTables(tablesRes.tables);
      if (configRes.success) setOracleConfig(configRes.config);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function testConfig() {
    try {
      const result = await api.oracle.testConfig(configForm);
      alert(result.success && result.valid ? '连接成功！' : `连接失败: ${result.error}`);
    } catch (error) {
      alert('测试连接失败');
    }
  }

  async function saveConfig() {
    try {
      await api.oracle.saveConfig(configForm);
      setShowConfig(false);
      alert('配置保存成功！');
      await loadData();
    } catch (error) {
      alert('保存配置失败');
    }
  }

  async function loadRemoteTables() {
    if (!oracleConfig) {
      setShowConfig(true);
      return;
    }
    try {
      const result = await api.oracle.getRemoteTables(schemaInput || undefined);
      if (result.success) setRemoteTables(result.tables);
    } catch (error) {
      alert('加载远程表失败');
    }
  }

  async function loadTableStructure(tableName: string) {
    if (!oracleConfig) return;
    try {
      const result = await api.oracle.getRemoteTableStructure(tableName, schemaInput || undefined);
      if (result.success) {
        const columns: ColumnMetadata[] = result.columns.map(col => ({
          columnName: col.columnName,
          dataType: col.dataType,
          nullable: col.nullable,
          primaryKey: col.primaryKey,
          comment: col.comment || col.columnName,
          displayName: col.columnName,
        }));
        setTableForm({
          ...tableForm,
          tableName,
          displayName: tableName,
          schema: schemaInput,
          columns,
          relationships: [],
        });
        setSelectedRemoteTable('');
      }
    } catch (error) {
      alert('加载表结构失败');
    }
  }

  async function saveTable() {
    try {
      if (editingTable) {
        await api.oracle.updateTable(editingTable.id, tableForm);
      } else {
        await api.oracle.saveTable(tableForm);
      }
      setShowModal(false);
      setEditingTable(null);
      resetForm();
      await loadData();
    } catch (error) {
      alert('保存表失败');
    }
  }

  async function deleteTable(id: string) {
    if (!confirm('确定要删除这个表吗？')) return;
    try {
      await api.oracle.deleteTable(id);
      await loadData();
    } catch (error) {
      alert('删除表失败');
    }
  }

  function editTable(table: TableMetadata) {
    setEditingTable(table);
    setTableForm({
      tableName: table.tableName,
      displayName: table.displayName,
      tableComment: table.tableComment,
      schema: table.schema,
      columns: table.columns,
      relationships: table.relationships,
      tags: table.tags,
    });
    setShowModal(true);
  }

  function resetForm() {
    setTableForm({
      tableName: '',
      displayName: '',
      tableComment: '',
      schema: '',
      columns: [],
      relationships: [],
    });
    setEditingTable(null);
  }

  function addColumn() {
    setTableForm({
      ...tableForm,
      columns: [...tableForm.columns, {
        columnName: '',
        dataType: 'VARCHAR2',
        nullable: true,
        primaryKey: false,
        comment: '',
        displayName: '',
      }],
    });
  }

  function updateColumn(index: number, updates: Partial<ColumnMetadata>) {
    const newColumns = [...tableForm.columns];
    newColumns[index] = { ...newColumns[index], ...updates };
    setTableForm({ ...tableForm, columns: newColumns });
  }

  function removeColumn(index: number) {
    setTableForm({
      ...tableForm,
      columns: tableForm.columns.filter((_, i) => i !== index),
    });
  }

  function addRelationship() {
    setTableForm({
      ...tableForm,
      relationships: [...tableForm.relationships, {
        fromTable: tableForm.tableName,
        fromColumn: '',
        toTable: '',
        toColumn: '',
        type: 'many-to-one' as const,
      }],
    });
  }

  function updateRelationship(index: number, updates: Partial<TableRelationship>) {
    const newRelationships = [...tableForm.relationships];
    newRelationships[index] = { ...newRelationships[index], ...updates };
    setTableForm({ ...tableForm, relationships: newRelationships });
  }

  function removeRelationship(index: number) {
    setTableForm({
      ...tableForm,
      relationships: tableForm.relationships.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">数据表管理</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowConfig(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            <Eye size={16} />
            Oracle 配置
          </button>
          <button
            onClick={loadRemoteTables}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
          >
            <RefreshCw size={16} />
            从 Oracle 加载表
          </button>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:opacity-90"
          >
            <Plus size={16} />
            添加表
          </button>
        </div>
      </div>

      {remoteTables.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">选择要导入的表</h3>
          <div className="grid grid-cols-4 gap-3">
            {remoteTables.map(table => (
              <button
                key={table}
                onClick={() => loadTableStructure(table)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 text-left"
              >
                {table}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {tables.map(table => (
            <div key={table.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{table.displayName}</h3>
                  <p className="text-sm text-slate-500">{table.tableName} {table.schema && `(${table.schema})`}</p>
                  <p className="text-slate-600 mt-1">{table.tableComment}</p>
                  <div className="mt-2 text-sm text-slate-500">
                    {table.columns.length} 个字段
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editTable(table)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => deleteTable(table.id)}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              {table.columns.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="grid grid-cols-4 gap-3 text-sm">
                    {table.columns.slice(0, 8).map(col => (
                      <div key={col.columnName} className="bg-slate-50 rounded px-3 py-2">
                        <span className="font-medium">{col.displayName || col.columnName}</span>
                        <span className="text-slate-400 ml-2">({col.dataType})</span>
                      </div>
                    ))}
                    {table.columns.length > 8 && (
                      <div className="text-slate-400">+{table.columns.length - 8} 更多</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {tables.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center text-slate-500">
              <Database size={48} className="mx-auto mb-4 text-slate-300" />
              <p>还没有添加任何数据表</p>
            </div>
          )}
        </div>
      )}

      {showConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Oracle 连接配置</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">用户名</label>
                <input
                  type="text"
                  value={configForm.user}
                  onChange={(e) => setConfigForm({ ...configForm, user: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
                <input
                  type="password"
                  value={configForm.password}
                  onChange={(e) => setConfigForm({ ...configForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">主机</label>
                <input
                  type="text"
                  value={configForm.host}
                  onChange={(e) => setConfigForm({ ...configForm, host: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">端口</label>
                <input
                  type="number"
                  value={configForm.port}
                  onChange={(e) => setConfigForm({ ...configForm, port: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SID</label>
                <input
                  type="text"
                  value={configForm.sid}
                  onChange={(e) => setConfigForm({ ...configForm, sid: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={testConfig}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  测试连接
                </button>
                <button
                  onClick={() => setShowConfig(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  onClick={saveConfig}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto py-8">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingTable ? '编辑表' : '添加表'}
            </h2>
            <div className="space-y-4 max-h-[70vh] overflow-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">表名</label>
                  <input
                    type="text"
                    value={tableForm.tableName}
                    onChange={(e) => setTableForm({ ...tableForm, tableName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">显示名称</label>
                  <input
                    type="text"
                    value={tableForm.displayName}
                    onChange={(e) => setTableForm({ ...tableForm, displayName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Schema</label>
                  <input
                    type="text"
                    value={tableForm.schema}
                    onChange={(e) => setTableForm({ ...tableForm, schema: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">标签（逗号分隔）</label>
                  <input
                    type="text"
                    value={tableForm.tags?.join(',') || ''}
                    onChange={(e) => setTableForm({ ...tableForm, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">表描述</label>
                <textarea
                  value={tableForm.tableComment}
                  onChange={(e) => setTableForm({ ...tableForm, tableComment: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  rows={3}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-slate-700">字段列表</label>
                  <button
                    onClick={addColumn}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + 添加字段
                  </button>
                </div>
                {tableForm.columns.map((col, idx) => (
                  <div key={idx} className="grid grid-cols-6 gap-2 mb-2 items-end">
                    <div>
                      <input
                        type="text"
                        placeholder="字段名"
                        value={col.columnName}
                        onChange={(e) => updateColumn(idx, { columnName: e.target.value })}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="显示名"
                        value={col.displayName}
                        onChange={(e) => updateColumn(idx, { displayName: e.target.value })}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <select
                        value={col.dataType}
                        onChange={(e) => updateColumn(idx, { dataType: e.target.value })}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                      >
                        <option>VARCHAR2</option>
                        <option>NUMBER</option>
                        <option>DATE</option>
                        <option>TIMESTAMP</option>
                        <option>CLOB</option>
                        <option>BLOB</option>
                      </select>
                    </div>
                    <div className="flex gap-2 items-center">
                      <label className="text-xs flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={col.primaryKey}
                          onChange={(e) => updateColumn(idx, { primaryKey: e.target.checked })}
                        />
                        PK
                      </label>
                      <label className="text-xs flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={col.nullable}
                          onChange={(e) => updateColumn(idx, { nullable: e.target.checked })}
                        />
                        NULL
                      </label>
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="描述"
                        value={col.comment}
                        onChange={(e) => updateColumn(idx, { comment: e.target.value })}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                      />
                    </div>
                    <button
                      onClick={() => removeColumn(idx)}
                      className="px-2 py-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-slate-700">表关系</label>
                  <button
                    onClick={addRelationship}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + 添加关系
                  </button>
                </div>
                {tableForm.relationships.map((rel, idx) => (
                  <div key={idx} className="grid grid-cols-6 gap-2 mb-2 items-end">
                    <div>
                      <input
                        type="text"
                        placeholder="源字段"
                        value={rel.fromColumn}
                        onChange={(e) => updateRelationship(idx, { fromColumn: e.target.value })}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                      />
                    </div>
                    <div className="text-center text-slate-400">→</div>
                    <div>
                      <input
                        type="text"
                        placeholder="目标表"
                        value={rel.toTable}
                        onChange={(e) => updateRelationship(idx, { toTable: e.target.value })}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="目标字段"
                        value={rel.toColumn}
                        onChange={(e) => updateRelationship(idx, { toColumn: e.target.value })}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <select
                        value={rel.type}
                        onChange={(e) => updateRelationship(idx, { type: e.target.value as any })}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                      >
                        <option value="one-to-one">一对一</option>
                        <option value="one-to-many">一对多</option>
                        <option value="many-to-one">多对一</option>
                        <option value="many-to-many">多对多</option>
                      </select>
                    </div>
                    <button
                      onClick={() => removeRelationship(idx)}
                      className="px-2 py-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={saveTable}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
