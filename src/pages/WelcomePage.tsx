import React from 'react';
// Badge import removed
import { UploadCard } from '../components/organisms/UploadCard';
import { ScanSearch, CalendarClock, FolderTree, FileSpreadsheet, ChevronDown, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { ThemeToggle } from '../components/atoms/ThemeToggle';
import { detectVendorId } from '../services/pdfParser';
import { VENDORS } from '../config/vendorConfig';

interface WelcomePageProps {
  onFilesSelect: (files: File[]) => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onFilesSelect }) => {
  const [files, setFiles] = React.useState<File[]>([]);
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});

  const handleFilesAdd = (newFiles: File[]) => {
    setFiles(prev => {
      const map = new Map(prev.map(f => [f.name + f.size, f]));
      newFiles.forEach(f => map.set(f.name + f.size, f));

      const sorted = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      return sorted;
    });
  };

  const handleRemoveFile = (file: File) => {
    setFiles(prev => prev.filter(f => f !== file));
  };

  const toggleGroupAccordion = (groupKey: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const handleStartAnalysis = () => {
    const validFiles = files.filter(file => fileStatus[file.name + file.size]);
    if (validFiles.length === 0) {
      alert('目前沒有可進行分析的檔案（請確認是 PDF 檔，且檔名包含「中國附醫」或「童綜合」）');
      return;
    }
    onFilesSelect(validFiles);
  };

  const fileStatus = React.useMemo(() => {
    const status: Record<string, boolean> = {};
    files.forEach(file => {
      const key = file.name + file.size;
      const isPdf = file.name.toLowerCase().endsWith('.pdf');
      const hasVendor = file.name.includes('中國附醫') || file.name.includes('童綜合');
      status[key] = isPdf && hasVendor;
    });
    return status;
  }, [files]);

  const vendorGroups = React.useMemo(() => {
    const groups: Record<string, File[]> = {};
    files.forEach(file => {
      const vendorId = detectVendorId(file.name);
      if (!groups[vendorId]) groups[vendorId] = [];
      groups[vendorId].push(file);
    });

    Object.values(groups).forEach(group => {
      group.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    });

    return groups;
  }, [files]);

  // Auto-expand all vendor groups when the files list changes
  React.useEffect(() => {
    const newExpanded: Record<string, boolean> = {};
    Object.keys(vendorGroups).forEach(vendorId => {
      newExpanded[`vendor-${vendorId}`] = true;
    });
    setExpandedGroups(prev => ({ ...newExpanded, ...prev }));
  }, [vendorGroups]);

  return (
    <div className="welcome-container" style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      padding: '1.5rem 6vw',
      gap: '3rem'
    }}>
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '50vw',
        height: '100%',
        background: 'radial-gradient(ellipse at center left, rgba(99, 102, 241, 0.1), transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Left Column: Features + Selected Files */}
      <div className="feature-column" style={{
        flex: '0 0 450px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        zIndex: 1,
        textAlign: 'left',
        gap: '1.25rem',
        position: 'relative'
      }}>
        <div style={{ marginBottom: '2rem', paddingLeft: '6.5rem', transition: 'padding 0.3s ease' }}>
          <ThemeToggle />
        </div>

        {/* Feature Highlights - Vertical Stack */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          width: '100%'
        }}>
          {[
            { icon: <ScanSearch size={22} aria-label="搜尋" />, text: '自動定位核心' },
            { icon: <CalendarClock size={22} aria-label="日曆" />, text: '西元日期轉換' },
            { icon: <FolderTree size={22} aria-label="資料夾" />, text: '月份自動分類' },
            { icon: <FileSpreadsheet size={22} aria-label="試算表" />, text: '一鍵導出表格' }
          ].map((feature, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem 1.5rem',
              background: 'var(--card)',
              border: '1px solid var(--glass-border)',
              borderRadius: '100px',
              color: 'var(--text-main)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <span style={{ color: 'var(--primary-light)', display: 'flex' }}>
                {feature.icon}
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 500, letterSpacing: '0.5px' }}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        {/* Selected Files Overlay */}
        {files.length > 0 && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(18, 23, 39, 0.95)',
            padding: '1.5rem 2rem',
            borderRadius: '18px',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, color: 'white' }}>已選擇的檔案 ({files.length})</div>
              <button
                onClick={() => setFiles([])}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.65)',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                清除
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', flex: 1 }}>
              {Object.entries(vendorGroups).map(([vendorId, group]) => {
                const groupKey = `vendor-${vendorId}`;
                const expanded = !!expandedGroups[groupKey];
                const vendorName = VENDORS[vendorId]?.name || vendorId;

                return (
                  <div key={groupKey} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(0,0,0,0.25)',
                    overflow: 'hidden'
                  }}>
                    <button
                      onClick={() => toggleGroupAccordion(groupKey)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.55rem 0.75rem',
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        color: 'rgba(255,255,255,0.9)',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ fontWeight: 700 }}>{vendorName}</span>
                      {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>

                    {expanded && (
                      <div style={{
                        padding: '0.75rem',
                        background: 'rgba(0,0,0,0.18)',
                        borderTop: '1px solid rgba(255,255,255,0.12)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}>
                        {group.map(file => {
                          const key = file.name + file.size;
                          const isValid = !!fileStatus[key];
                          return (
                            <div key={key} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '0.5rem 0',
                              borderBottom: '1px solid rgba(255,255,255,0.1)'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, color: 'rgba(255,255,255,0.9)' }} title={file.name}>
                                {isValid ? (
                                  <CheckCircle2 size={16} color="var(--accent)" style={{ flexShrink: 0, marginRight: '0.5rem' }} />
                                ) : (
                                  <XCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginRight: '0.5rem' }} />
                                )}
                                <span style={{
                                  textDecoration: isValid ? 'none' : 'line-through',
                                  opacity: isValid ? 1 : 0.75,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>{file.name}</span>
                              </div>
                              <button
                                onClick={() => handleRemoveFile(file)}
                                style={{
                                  border: 'none',
                                  background: 'rgba(255,255,255,0.1)',
                                  color: 'rgba(255,255,255,0.9)',
                                  borderRadius: '10px',
                                  padding: '0.35rem 0.75rem',
                                  cursor: 'pointer'
                                }}
                              >
                                取消
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleStartAnalysis}
              disabled={!Object.values(fileStatus).some(Boolean)}
              style={{
                padding: '0.75rem 1.25rem',
                width: '100%',
                borderRadius: '12px',
                background: Object.values(fileStatus).some(Boolean) ? 'var(--primary)' : 'rgba(99, 102, 241, 0.4)',
                color: 'white',
                border: 'none',
                fontWeight: 700,
                cursor: Object.values(fileStatus).some(Boolean) ? 'pointer' : 'not-allowed',
                opacity: Object.values(fileStatus).some(Boolean) ? 1 : 0.75
              }}
            >
              執行分析
            </button>
          </div>
        )}
      </div>

      {/* Right Column: Upload Area */}
      <div className="upload-column" style={{
        flex: 1,
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'center'
      }}>
        <UploadCard onFilesAdd={handleFilesAdd} />
      </div>

      <style>{`
        @media (max-width: 900px) {
          .welcome-container {
            flex-direction: column !important;
            padding: 2rem !important;
            overflow-y: auto !important;
            gap: 2rem !important;
          }
          .feature-column {
            flex: none !important;
            width: 100% !important;
            align-items: center !important;
          }
          .upload-column {
            min-height: 400px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default WelcomePage;

