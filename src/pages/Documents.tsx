import { useState, useEffect, useCallback } from 'react';
import { Upload, FileText, Trash2, File, FileSpreadsheet, FileCode, Loader2 } from 'lucide-react';
import { useAppStore } from '../store';
import { api } from '../services/api';
import type { Document } from '../../shared/types.js';

function getFileIcon(type: string) {
  switch (type) {
    case 'pdf':
      return <FileText className="text-red-500" />;
    case 'docx':
      return <FileSpreadsheet className="text-blue-500" />;
    case 'md':
      return <FileCode className="text-gray-600" />;
    default:
      return <File className="text-slate-500" />;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function Documents() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const { documents, setDocuments, addDocument, removeDocument } = useAppStore();

  const loadDocuments = useCallback(async () => {
    try {
      const response = await api.documents.getAll();
      if (response.success) {
        setDocuments(response.documents);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  }, [setDocuments]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['.pdf', '.txt', '.md', '.docx'];
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      alert('不支持的文件类型。请上传 PDF、TXT、MD 或 DOCX 文件。');
      return;
    }

    setIsUploading(true);
    
    try {
      const response = await api.documents.upload(file);
      if (response.success) {
        addDocument(response.document);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('上传失败，请重试。');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`确定要删除文档 "${doc.name}" 吗？`)) return;
    
    setDeletingId(doc.id);
    
    try {
      const response = await api.documents.delete(doc.id);
      if (response.success) {
        removeDocument(doc.id);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('删除失败，请重试。');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="h-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">文档管理</h2>
        <p className="text-slate-500 mt-1">
          上传并管理您的文档，用于智能问答
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mb-8 border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
        }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-slate-600 font-medium">正在处理文档...</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload size={32} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              拖拽文件到这里或点击上传
            </h3>
            <p className="text-slate-500 mb-4">
              支持 PDF、TXT、Markdown、DOCX 格式
            </p>
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all cursor-pointer">
              <FileText size={20} />
              选择文件
              <input
                type="file"
                accept=".pdf,.txt,.md,.docx"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">
            已上传文档 ({documents.length})
          </h3>
        </div>

        {documents.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={40} className="text-slate-400" />
            </div>
            <p className="text-slate-500">暂无文档，上传文档开始使用</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    {getFileIcon(doc.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">{doc.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                      <span>{formatFileSize(doc.size)}</span>
                      <span>·</span>
                      <span>{doc.chunkCount} 个片段</span>
                      <span>·</span>
                      <span>{formatDate(doc.uploadTime)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc)}
                  disabled={deletingId === doc.id}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deletingId === doc.id ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Trash2 size={20} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
