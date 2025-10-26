import React, { useState, useEffect } from 'react';
import { Calendar, Plus, ArrowLeft, Search, Filter } from 'lucide-react';
import MeetingRecorderComponent from '../components/MeetingRecorderComponent';
import { loadMeetingsFromSupabase } from '../services/meetingService';
import { supabase } from '../lib/supabase';

interface Meeting {
  id: number;
  title: string;
  department: string;
  type: string;
  date: string;
  start_time: string;
  end_time?: string;
  participants: string[];
  status: string;
  summary?: string;
  notes?: string;
  created_at?: string;
}

interface MeetingsPageProps {
  onBack?: () => void;
  userEmail?: string;
  userName?: string;
}

export const MeetingsPage: React.FC<MeetingsPageProps> = ({
  onBack,
  userEmail = 'carlossuarezparra@gmail.com',
  userName = 'Carlos Suárez'
}) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showRecorder, setShowRecorder] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error cargando reuniones:', error);
        return;
      }

      setMeetings(data || []);
      console.log('✅ Reuniones cargadas:', data?.length || 0);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || meeting.status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || meeting.department === filterDepartment;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const departments = [...new Set(meetings.map(m => m.department))];

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'in_progress': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programada';
      case 'in_progress': return 'En curso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  if (showRecorder && selectedMeeting) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        padding: '24px'
      }}>
        <button
          onClick={() => {
            setShowRecorder(false);
            setSelectedMeeting(null);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '24px'
          }}
        >
          <ArrowLeft size={16} />
          Volver a Reuniones
        </button>

        <MeetingRecorderComponent
          meetingId={selectedMeeting.id}
          meetingTitle={selectedMeeting.title}
          participants={selectedMeeting.participants}
          onRecordingComplete={(data) => {
            console.log('Grabación completada:', data);
            // Actualizar reunión con los datos
            setShowRecorder(false);
            setSelectedMeeting(null);
            loadMeetings();
          }}
        />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px'
                }}
              >
                <ArrowLeft size={24} color="#374151" />
              </button>
            )}
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>
              📅 Gestión de Reuniones
            </h1>
          </div>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: 0
          }}>
            Bienvenido, {userName}
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedMeeting(null);
            setShowRecorder(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <Plus size={16} />
          Nueva Reunión
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px'
      }}>
        {/* Búsqueda */}
        <div>
          <label style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#6b7280',
            display: 'block',
            marginBottom: '8px'
          }}>
            Buscar
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            padding: '8px 12px'
          }}>
            <Search size={16} color="#6b7280" />
            <input
              type="text"
              placeholder="Buscar reunión..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                color: '#374151'
              }}
            />
          </div>
        </div>

        {/* Filtro de Estado */}
        <div>
          <label style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#6b7280',
            display: 'block',
            marginBottom: '8px'
          }}>
            Estado
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="all">Todos los estados</option>
            <option value="scheduled">Programada</option>
            <option value="in_progress">En curso</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>

        {/* Filtro de Departamento */}
        <div>
          <label style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#6b7280',
            display: 'block',
            marginBottom: '8px'
          }}>
            Departamento
          </label>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="all">Todos los departamentos</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Reuniones */}
      <div style={{
        display: 'grid',
        gap: '16px'
      }}>
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: '#6b7280'
          }}>
            Cargando reuniones...
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <Calendar size={48} style={{
              margin: '0 auto 16px',
              color: '#d1d5db'
            }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              No hay reuniones
            </h3>
            <p style={{
              color: '#6b7280',
              marginBottom: '24px'
            }}>
              Crea una nueva reunión para comenzar
            </p>
            <button
              onClick={() => setShowRecorder(true)}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} style={{ marginRight: '8px' }} />
              Nueva Reunión
            </button>
          </div>
        ) : (
          filteredMeetings.map(meeting => (
            <div
              key={meeting.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '20px',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: 0
                  }}>
                    {meeting.title}
                  </h3>
                  <span style={{
                    backgroundColor: getStatusColor(meeting.status),
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {getStatusLabel(meeting.status)}
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <div>
                    <span style={{ fontWeight: '600' }}>📅 Fecha:</span> {formatDate(meeting.date)}
                  </div>
                  <div>
                    <span style={{ fontWeight: '600' }}>🕐 Hora:</span> {meeting.start_time}
                    {meeting.end_time && ` - ${meeting.end_time}`}
                  </div>
                  <div>
                    <span style={{ fontWeight: '600' }}>🏢 Departamento:</span> {meeting.department}
                  </div>
                  <div>
                    <span style={{ fontWeight: '600' }}>👥 Participantes:</span> {meeting.participants.length}
                  </div>
                </div>

                {meeting.summary && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#374151'
                  }}>
                    <strong>Resumen:</strong> {meeting.summary}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setSelectedMeeting(meeting);
                  setShowRecorder(true);
                }}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                🎙️ Grabar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MeetingsPage;
