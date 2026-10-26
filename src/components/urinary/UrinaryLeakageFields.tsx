import React from 'react';
import type { LeakageType, LeakageAmount, PadStatus } from '../../types';
import { LEAKAGE_TYPES, LEAKAGE_AMOUNTS, PAD_STATUSES } from '../../data/clinicalScales';
import { MetricFieldWrapper } from '../common';

export interface UrinaryLeakageFieldsProps {
  leakageType: LeakageType;
  onChangeLeakageType: (val: LeakageType) => void;
  leakageAmount: LeakageAmount;
  onChangeLeakageAmount: (val: LeakageAmount) => void;
  leakageActivity: string;
  onChangeLeakageActivity: (val: string) => void;
  padUsage: PadStatus;
  onChangePadUsage: (val: PadStatus) => void;
  metricComments: Record<string, string>;
  onCommentChange: (key: string, comment: string) => void;
}

export const UrinaryLeakageFields: React.FC<UrinaryLeakageFieldsProps> = ({
  leakageType,
  onChangeLeakageType,
  leakageAmount,
  onChangeLeakageAmount,
  leakageActivity,
  onChangeLeakageActivity,
  padUsage,
  onChangePadUsage,
  metricComments,
  onCommentChange
}) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--danger, #C62828)', marginBottom: '10px' }}>
        Incontinence & Leakage Details
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
        <MetricFieldWrapper
          label="Leakage Type"
          comment={metricComments['leakageType']}
          onCommentChange={(comment) => onCommentChange('leakageType', comment)}
        >
          <select
            id="leak-type"
            className="form-select"
            value={leakageType}
            onChange={(e) => onChangeLeakageType(e.target.value as LeakageType)}
          >
            {LEAKAGE_TYPES.filter((lt) => lt.value !== 'none').map((lt) => (
              <option key={lt.value} value={lt.value}>{lt.label}</option>
            ))}
          </select>
        </MetricFieldWrapper>

        <MetricFieldWrapper
          label="Leakage Volume"
          comment={metricComments['leakageAmount']}
          onCommentChange={(comment) => onCommentChange('leakageAmount', comment)}
        >
          <select
            id="leak-amt"
            className="form-select"
            value={leakageAmount}
            onChange={(e) => onChangeLeakageAmount(e.target.value as LeakageAmount)}
          >
            {LEAKAGE_AMOUNTS.filter((la) => la.value !== 'none').map((la) => (
              <option key={la.value} value={la.value}>{la.label}</option>
            ))}
          </select>
        </MetricFieldWrapper>
      </div>

      <MetricFieldWrapper
        label="Trigger Activity At Time of Leak"
        comment={metricComments['leakageActivity']}
        onCommentChange={(comment) => onCommentChange('leakageActivity', comment)}
      >
        <input
          type="text"
          id="leak-activity"
          className="form-input"
          placeholder="e.g. Coughing, sneezing, lifting box, jogging, standing from chair"
          value={leakageActivity}
          onChange={(e) => onChangeLeakageActivity(e.target.value)}
        />
      </MetricFieldWrapper>

      <MetricFieldWrapper
        label="Pad Status / Protection"
        comment={metricComments['padUsage']}
        onCommentChange={(comment) => onCommentChange('padUsage', comment)}
      >
        <select
          id="pad-status"
          className="form-select"
          value={padUsage}
          onChange={(e) => onChangePadUsage(e.target.value as PadStatus)}
        >
          {PAD_STATUSES.map((ps) => (
            <option key={ps.value} value={ps.value}>{ps.label}</option>
          ))}
        </select>
      </MetricFieldWrapper>
    </div>
  );
};
