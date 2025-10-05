import React, { useState, useEffect } from 'react';
import { RecurrenceRule, RecurrencePattern } from '../../types/dashboard';
import { X, Save, ChevronDown } from 'lucide-react';

interface RecurrenceModalProps {
  initialRule?: RecurrenceRule;
  onSave: (rule: RecurrenceRule) => void;
  onClose: () => void;
}

export const RecurrenceModal: React.FC<RecurrenceModalProps> = ({
  initialRule,
  onSave,
  onClose
}) => {
  const [pattern, setPattern] = useState<RecurrencePattern>(initialRule?.pattern || 'weekly');
  const [interval, setInterval] = useState(initialRule?.interval || 1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(initialRule?.daysOfWeek || []);
  const [endDate, setEndDate] = useState(initialRule?.endDate || '');

  const days = [
    { id: 0, name: 'Domingo', short: 'Dom' },
    { id: 1, name: 'Lunes', short: 'Lun' },
    { id: 2, name: 'Martes', short: 'Mar' },
    { id: 3, name: 'Miércoles', short: 'Mié' },
    { id: 4, name: 'Jueves', short: 'Jue' },
    { id: 5, name: 'Viernes', short: 'Vie' },
    { id: 6, name: 'Sábado', short: 'Sáb' }
  ];

  const handleDayToggle = (dayId: number) => {
    setDaysOfWeek(prev => 
      prev.includes(dayId)
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId].sort((a, b) => a - b)
    );
  };

  const handleSave = () => {
    const rule: RecurrenceRule = {
      pattern,
      interval: Math.max(1, interval),
      ...(pattern === 'weekly' && { daysOfWeek: daysOfWeek.length ? daysOfWeek : [new Date().getDay()] }),
      ...(endDate && { endDate })
    };
    onSave(rule);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Configurar Recurrencia</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <div className="form-group">
            <label>Se repite</label>
            <div className="select-wrapper">
              <select 
                value={pattern}
                onChange={(e) => setPattern(e.target.value as RecurrencePattern)}
              >
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
                <option value="biweekly">Quincenalmente</option>
                <option value="monthly">Mensualmente</option>
              </select>
              <ChevronDown size={16} className="select-arrow" />
            </div>
          </div>

          {pattern === 'weekly' && (
            <div className="form-group">
              <label>Días de la semana</label>
              <div className="days-grid">
                {days.map(day => (
                  <button
                    key={day.id}
                    type="button"
                    className={`day-btn ${daysOfWeek.includes(day.id) ? 'selected' : ''}`}
                    onClick={() => handleDayToggle(day.id)}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Repetir cada</label>
            <div className="interval-selector">
              <input
                type="number"
                min="1"
                max="99"
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                className="interval-input"
              />
              <span className="interval-label">
                {pattern === 'daily' && (interval === 1 ? 'día' : 'días')}
                {pattern === 'weekly' && (interval === 1 ? 'semana' : 'semanas')}
                {pattern === 'biweekly' && (interval === 1 ? 'quincena' : 'quincenas')}
                {pattern === 'monthly' && (interval === 1 ? 'mes' : 'meses')}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>Finalizar</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="endType"
                  checked={!endDate}
                  onChange={() => setEndDate('')}
                />
                <span>Nunca</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="endType"
                  checked={!!endDate}
                  onChange={() => {
                    if (!endDate) {
                      const futureDate = new Date();
                      futureDate.setMonth(futureDate.getMonth() + 3);
                      setEndDate(futureDate.toISOString().split('T')[0]);
                    }
                  }}
                />
                <span>El</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="date-input"
                  disabled={!endDate}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
          >
            <Save size={16} /> Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
