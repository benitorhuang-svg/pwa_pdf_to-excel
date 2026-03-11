import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface UploadCardProps {
  onFileSelect: (file: File) => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isDragOver, setIsDragOver] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      style={{
        width: '100%',
        height: '100%',
        border: `2px ${isDragOver ? 'solid var(--primary)' : 'dashed var(--glass-border)'}`,
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        cursor: 'pointer',
        background: 'var(--card)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
      }}
      className="upload-card"
    >
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(99, 102, 241, 0.15), transparent 50%)`,
        opacity: isDragOver ? 1 : 0.8,
        transition: 'opacity 0.4s'
      }}></div>

      <h1 style={{
        fontSize: '3rem',
        margin: '0 0 3rem 0',
        background: 'var(--title-grad)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 800,
        letterSpacing: '-1.5px',
        position: 'relative',
        zIndex: 1
      }}>
        發票提取工具
      </h1>

      <UploadCloud size={64} style={{
        color: 'var(--primary-light)',
        marginBottom: '1.5rem',
        filter: 'drop-shadow(0 0 16px rgba(99, 102, 241, 0.3))',
        position: 'relative',
        zIndex: 1
      }} />
      <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'white', fontWeight: 600, position: 'relative', zIndex: 1, letterSpacing: '0.5px' }}>上傳發票 PDF</h3>
      <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.95rem', position: 'relative', zIndex: 1 }}>拖放檔案或點擊此處選取</p>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => e.target.files && onFileSelect(e.target.files[0])}
        accept=".pdf" 
        style={{ display: 'none' }} 
      />
    </div>
  );
};
