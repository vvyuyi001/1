import { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, Trash2, Plus, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { uploadDocument, getDocuments, deleteDocument } from '../lib/api';

export function KnowledgePage() {
  const { documents, setDocuments, addDocument, removeDocument } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  }, [setDocuments]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const response = await uploadDocument(file);
      addDocument(response.document);
    } catch (error) {
      console.error('Failed to upload document:', error);
      alert('上传失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    await Promise.all(files.map(handleFileUpload));
  }, [handleFileUpload]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await Promise.all(files.map(handleFileUpload));
  }, [handleFileUpload]);

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('确定要删除这个文档吗？')) return;
    
    try {
      await deleteDocument(id);
      removeDocument(id);
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('删除失败，请重试');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'docx':
        return '📝';
      case 'md':
        return '📋';
      default:
        return '📄';
    }
  };

  return (
    <div className="h-full bg-dark p-6 overflow-y-auto scrollbar-thin">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">知识库管理</h2>
          <p className="text-slate-400">
            上传文档到知识库，支持 PDF、TXT、Markdown、Word 格式
          </p>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mb-8 border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
            isDragging
              ? 'border-secondary bg-primary/10'
              : 'border-slate-600 bg-dark-light hover:border-slate-500'
          }`}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-secondary animate-spin" />
              <p className="text-white">正在处理文档...</p>
            </div>
          ) : (
            <>
              <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-secondary' : 'text-slate-500'}`} />
              <p className="text-white text-lg mb-2">
                {isDragging ? '松开鼠标上传文件' : '拖拽文件到这里或点击选择'}
              </p>
              <p className="text-slate-400 text-sm mb-4">
                支持 PDF、TXT、MD、DOCX 格式
              </p>
              <label className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl cursor-pointer hover:opacity-90 transition-all">
                <Plus className="w-5 h-5" />
                选择文件
                <input
                  type="file"
                  multiple
                  accept=".pdf,.txt,.md,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
            </>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              文档列表 ({documents.length})
            </h3>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">暂无文档，请上传文档</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-dark-light border border-slate-700 rounded-xl p-4 flex items-center justify-between hover:border-slate-600 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-2xl">
                      {getFileIcon(doc.type)}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{doc.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>{formatFileSize(doc.size)}</span>
                        <span>•</span>
                        <span>{doc.chunkCount} 个文本块</span>
                        <span>•</span>
                        <span>
                          {new Date(doc.uploadTime).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
