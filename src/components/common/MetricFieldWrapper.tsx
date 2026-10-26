import React, { useState } from 'react';
import { MessageSquareText, Plus, X } from 'lucide-react';

export interface MetricFieldWrapperProps {
  id?: string;
  label: string;
  isNA?: boolean;
  onNAToggle?: (isNA: boolean) => void;
  comment?: string;
  onCommentChange?: (comment: string) => void;
  commentPlaceholder?: string;
  helperText?: string;
  badge?: React.ReactNode;
  children: React.ReactNode | ((props: { isNA: boolean; disabled: boolean }) => React.ReactNode);
  className?: string;
  style?: React.CSSProperties;
}

export const MetricFieldWrapper: React.FC<MetricFieldWrapperProps> = ({
  id,
  label,
  isNA = false,
  onNAToggle,
  comment,
  onCommentChange,
  commentPlaceholder,
  helperText,
  badge,
  children,
  className = '',
  style
}) => {
  const hasComment = Boolean(comment && comment.trim().length > 0);
  const [isCommentOpen, setIsCommentOpen] = useState<boolean>(hasComment);
  const isCommentVisible = isCommentOpen || hasComment;

  const handleToggleComment = () => {
    setIsCommentOpen((prev) => !prev);
  };

  const handleClearComment = () => {
    onCommentChange?.('');
    setIsCommentOpen(false);
  };

  return (
    <div
      className={`metric-field-wrapper form-group ${className}`.trim()}
      style={{
        marginBottom: '18px',
        padding: '12px 14px',
        backgroundColor: 'var(--card-surface, #FFFFFF)',
        borderRadius: 'var(--radius-md, 12px)',
        border: '1px solid var(--card-border-subtle, #E8EFEA)',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(28, 45, 39, 0.05))',
        transition: 'border-color 0.15s ease',
        ...style
      }}
    >
      {/* Top Header Row: Label & Actions (N/A & Comment) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          marginBottom: '8px',
          flexWrap: 'wrap'
        }}
      >
        {/* Label and optional badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '160px' }}>
          <label
            htmlFor={id}
            className="form-label"
            style={{
              marginBottom: 0,
              fontWeight: 600,
              fontSize: '0.92rem',
              color: isNA ? 'var(--text-muted, #73847C)' : 'var(--text-primary, #1C2D27)'
            }}
          >
            {label}
          </label>
          {badge}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Discreet + Add Comment Button */}
          {onCommentChange && (
            <button
              type="button"
              onClick={handleToggleComment}
              className="metric-comment-toggle-btn"
              aria-label={isCommentVisible ? `Collapse note for ${label}` : `Add note for ${label}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: hasComment ? 'var(--accent-light, #E3F2ED)' : 'transparent',
                border: hasComment
                  ? '1px solid var(--accent-clinical, #2B7A68)'
                  : '1px dashed var(--card-border, #DCE5E0)',
                borderRadius: 'var(--radius-sm, 8px)',
                padding: '4px 8px',
                minHeight: '32px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: hasComment ? 'var(--accent-clinical, #2B7A68)' : 'var(--text-muted, #73847C)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {hasComment ? (
                <>
                  <MessageSquareText size={13} />
                  <span>Note</span>
                </>
              ) : (
                <>
                  <Plus size={13} />
                  <span>Add Note</span>
                </>
              )}
            </button>
          )}

          {/* Accessible [ ] N/A Checkbox */}
          {onNAToggle && (
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                userSelect: 'none',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: isNA ? 'var(--accent-clinical, #2B7A68)' : 'var(--text-muted, #73847C)',
                padding: '4px 8px',
                minHeight: '32px',
                borderRadius: 'var(--radius-sm, 8px)',
                backgroundColor: isNA ? 'var(--accent-light, #E3F2ED)' : 'transparent',
                border: isNA ? '1px solid var(--accent-clinical, #2B7A68)' : '1px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <input
                type="checkbox"
                checked={Boolean(isNA)}
                onChange={(e) => onNAToggle(e.target.checked)}
                aria-label={`Mark ${label} as Not Applicable`}
                style={{
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                  accentColor: 'var(--accent-clinical, #2B7A68)'
                }}
              />
              <span>N/A</span>
            </label>
          )}
        </div>
      </div>

      {/* Control Body (Dims and disables when N/A) */}
      <div
        style={{
          opacity: isNA ? 0.45 : 1,
          pointerEvents: isNA ? 'none' : 'auto',
          transition: 'opacity 0.2s ease'
        }}
        aria-disabled={Boolean(isNA)}
      >
        {typeof children === 'function'
          ? children({ isNA: Boolean(isNA), disabled: Boolean(isNA) })
          : children}
      </div>

      {/* Inline Comment Field (Collapsed unless comment exists or button toggled) */}
      {isCommentVisible && onCommentChange && (
        <div
          style={{
            marginTop: '10px',
            paddingTop: '8px',
            borderTop: '1px dashed var(--card-border-subtle, #E8EFEA)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <input
            type="text"
            className="form-input"
            value={comment ?? ''}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder={commentPlaceholder ?? `Add clinical note / trigger for ${label.toLowerCase()}...`}
            style={{
              fontSize: '0.82rem',
              minHeight: '36px',
              padding: '6px 10px',
              flex: 1
            }}
            aria-label={`Clinical note for ${label}`}
          />
          {comment && comment.length > 0 && (
            <button
              type="button"
              onClick={handleClearComment}
              className="icon-btn"
              aria-label={`Clear comment for ${label}`}
              title="Clear note"
              style={{ width: '36px', height: '36px', flexShrink: 0 }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {helperText && <div className="form-help" style={{ marginTop: '6px' }}>{helperText}</div>}
    </div>
  );
};
