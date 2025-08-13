import React, { useState, useEffect } from 'react';
import {
  Users, Calendar, Clock, FileText, AlertCircle, CheckCircle,
  TrendingUp, Award, Briefcase, DollarSign, Activity, Shield,
  Plus, Edit, Trash2, Eye, Download, Upload, Filter, Search,
  X, Save, Send, ChevronRight, BarChart3, PieChart, Settings,
  UserCheck, UserX, CalendarOff, ClipboardList, CreditCard
} from 'lucide-react';

// ============ INTERFACES ============
interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  center: string;
  contractType: 'indefinido' | 'temporal' | 'practicas';
  startDate: string;
  salary: number;
  status: 'activo' | 'baja' | 'vacaciones';
}

interface TimeEntry {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  totalHours?: number;
  status: 'presente' | 'tarde' | 'ausente';
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'vacaciones' | 'enfermedad' | 'personal' | 'maternidad';
  startDate: string;
  endDate: string;
  days: number;
  status: 'pendiente' | 'aprobada' | 'rechazada';
  reason?: string;
}

interface Payroll {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  baseSalary: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  status: 'pendiente' | 'procesada' | 'pagada';
}

// ============ DATOS DE EJEMPLO ============
const SAMPLE_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'María García',
    email: 'maria.garcia@jungla.com',
    position: 'Entrenadora Personal',
    department: 'Fitness',
    center: 'Sevilla Este',
    contractType: 'indefinido',
    startDate: '2022-03-15',
    salary: 28000,
    status: 'activo'
  },
  {
    id: '2',
    name: 'Juan López',
    email: 'juan.lopez@jungla.com',
    position: 'Recepcionista',
    department: 'Atención al Cliente',
    center: 'Sevilla Centro',
    contractType: 'temporal',
    startDate: '2023-06-01',
    salary: 18000,
    status: 'activo'
  },
  {
    id: '3',
    name: 'Ana Martínez',
    email: 'ana.martinez@jungla.com',
    position: 'Coordinadora',
    department: 'Administración',
    center: 'Mairena del Aljarafe',
    contractType: 'indefinido',
    startDate: '2021-01-10',
    salary: 32000,
    status: 'vacaciones'
  }
];

const SAMPLE_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: '1',
    employeeId: '3',
    employeeName: 'Ana Martínez',
    type: 'vacaciones',
    startDate: '2024-02-01',
    endDate: '2024-02-15',
    days: 10,
    status: 'aprobada',
    reason: 'Vacaciones familiares'
  },
  {
    id: '2',
    employeeId: '1',
    employeeName: 'María García',
    type: 'enfermedad',
    startDate: '2024-02-05',
    endDate: '2024-02-07',
    days: 3,
    status: 'pendiente',
    reason: 'Gripe'
  }
];

// ============ COMPONENTE PRINCIPAL ============
const HRManagementSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'attendance' | 'leaves' | 'payroll'>('dashboard');
  const [employees, setEmployees] = useState<Employee[]>(SAMPLE_EMPLOYEES);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(SAMPLE_LEAVE_REQUESTS);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showLeaveRequestModal, setShowLeaveRequestModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // ============ DASHBOARD ============
  const DashboardView = () => (
    <div>
      {/* KPIs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '2px solid #3b82f620'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              padding: '10px',
              backgroundColor: '#dbeafe',
              borderRadius: '10px'
            }}>
              <Users style={{ height: '24px', width: '24px', color: '#3b82f6' }} />
            </div>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Total Empleados</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                {employees.length}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp style={{ height: '16px', width: '16px', color: '#10b981' }} />
            <span style={{ fontSize: '12px', color: '#10b981' }}>+2 este mes</span>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '2px solid #10b98120'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              padding: '10px',
              backgroundColor: '#d1fae5',
              borderRadius: '10px'
            }}>
              <UserCheck style={{ height: '24px', width: '24px', color: '#10b981' }} />
            </div>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Activos Hoy</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                {employees.filter(e => e.status === 'activo').length}
              </p>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {Math.round((employees.filter(e => e.status === 'activo').length / employees.length) * 100)}% asistencia
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '2px solid #f59e0b20'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              padding: '10px',
              backgroundColor: '#fef3c7',
              borderRadius: '10px'
            }}>
              <CalendarOff style={{ height: '24px', width: '24px', color: '#f59e0b' }} />
            </div>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Solicitudes Pendientes</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                {leaveRequests.filter(l => l.status === 'pendiente').length}
              </p>
            </div>
          </div>
          <button style={{
            fontSize: '12px',
            color: '#f59e0b',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0
          }}>
            Ver solicitudes →
          </button>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '2px solid #8b5cf620'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              padding: '10px',
              backgroundColor: '#ede9fe',
              borderRadius: '10px'
            }}>
              <DollarSign style={{ height: '24px', width: '24px', color: '#8b5cf6' }} />
            </div>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Nómina Mensual</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                €{(employees.reduce((sum, e) => sum + e.salary, 0) / 12).toLocaleString('es-ES', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Próximo pago: 28 Feb
          </div>
        </div>
      </div>

      {/* Gráficos y tablas resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Empleados por Departamento
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Fitness', 'Atención al Cliente', 'Administración', 'Mantenimiento'].map(dept => {
              const count = employees.filter(e => e.department === dept).length;
              const percentage = (count / employees.length) * 100 || 0;
              return (
                <div key={dept}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', color: '#374151' }}>{dept}</span>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{count}</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: '#3b82f6',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Solicitudes Recientes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {leaveRequests.slice(0, 3).map(request => (
              <div key={request.id} style={{
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>
                    {request.employeeName}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                    {request.type === 'vacaciones' ? '🏖️' : '🏥'} {request.days} días
                  </p>
                </div>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: request.status === 'aprobada' ? '#d1fae5' : 
                                 request.status === 'pendiente' ? '#fef3c7' : '#fee2e2',
                  color: request.status === 'aprobada' ? '#065f46' : 
                         request.status === 'pendiente' ? '#92400e' : '#991b1b'
                }}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ============ VISTA DE EMPLEADOS ============
  const EmployeesView = () => (
    <div>
      {/* Barra de herramientas */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flex: 1,
          maxWidth: '400px'
        }}>
          <div style={{
            position: 'relative',
            flex: 1
          }}>
            <Search style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              height: '18px',
              width: '18px',
              color: '#6b7280'
            }} />
            <input
              type="text"
              placeholder="Buscar empleados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 40px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
          <button style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            backgroundColor: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Filter style={{ height: '16px', width: '16px' }} />
            Filtros
          </button>
        </div>
        
        <button
          onClick={() => setShowAddEmployeeModal(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus style={{ height: '16px', width: '16px' }} />
          Nuevo Empleado
        </button>
      </div>

      {/* Tabla de empleados */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                Empleado
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                Cargo
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                Departamento
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                Centro
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                Contrato
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                Estado
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {employees
              .filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(employee => (
                <tr key={employee.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#dbeafe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#3b82f6'
                      }}>
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>
                          {employee.name}
                        </p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                          {employee.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {employee.position}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {employee.department}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {employee.center}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      backgroundColor: employee.contractType === 'indefinido' ? '#dbeafe' : 
                                     employee.contractType === 'temporal' ? '#fef3c7' : '#e5e7eb',
                      color: employee.contractType === 'indefinido' ? '#1e40af' : 
                             employee.contractType === 'temporal' ? '#92400e' : '#374151'
                    }}>
                      {employee.contractType}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      backgroundColor: employee.status === 'activo' ? '#d1fae5' : 
                                     employee.status === 'vacaciones' ? '#fef3c7' : '#fee2e2',
                      color: employee.status === 'activo' ? '#065f46' : 
                             employee.status === 'vacaciones' ? '#92400e' : '#991b1b'
                    }}>
                      {employee.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button style={{
                        padding: '6px',
                        backgroundColor: '#f3f4f6',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}>
                        <Eye style={{ height: '16px', width: '16px', color: '#6b7280' }} />
                      </button>
                      <button style={{
                        padding: '6px',
                        backgroundColor: '#f3f4f6',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}>
                        <Edit style={{ height: '16px', width: '16px', color: '#6b7280' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ============ VISTA DE ASISTENCIA ============
  const AttendanceView = () => (
    <div>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
          Control de Asistencia - {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {employees.map(employee => (
            <div key={employee.id} style={{
              padding: '16px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#f9fafb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: '500', margin: 0 }}>{employee.name}</p>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>{employee.position}</p>
                </div>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  backgroundColor: '#d1fae5',
                  color: '#065f46'
                }}>
                  Presente
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Entrada</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', margin: '4px 0 0 0' }}>09:00</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Salida</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', margin: '4px 0 0 0' }}>--:--</p>
                </div>
              </div>
              
              <button style={{
                width: '100%',
                marginTop: '12px',
                padding: '8px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                Registrar Salida
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ============ VISTA DE SOLICITUDES ============
  const LeavesView = () => (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
          Gestión de Ausencias y Vacaciones
        </h3>
        <button
          onClick={() => setShowLeaveRequestModal(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus style={{ height: '16px', width: '16px' }} />
          Nueva Solicitud
        </button>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {leaveRequests.map(request => (
            <div key={request.id} style={{
              padding: '16px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#f9fafb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: '500', margin: 0 }}>
                    {request.employeeName}
                  </p>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>
                    {request.type === 'vacaciones' ? '🏖️ Vacaciones' : 
                     request.type === 'enfermedad' ? '🏥 Baja médica' :
                     request.type === 'personal' ? '👤 Asunto personal' : '🤱 Maternidad'}
                  </p>
                  <p style={{ fontSize: '14px', color: '#374151' }}>
                    {new Date(request.startDate).toLocaleDateString('es-ES')} - {new Date(request.endDate).toLocaleDateString('es-ES')} ({request.days} días)
                  </p>
                  {request.reason && (
                    <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>
                      Motivo: {request.reason}
                    </p>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: request.status === 'aprobada' ? '#d1fae5' : 
                                   request.status === 'pendiente' ? '#fef3c7' : '#fee2e2',
                    color: request.status === 'aprobada' ? '#065f46' : 
                           request.status === 'pendiente' ? '#92400e' : '#991b1b'
                  }}>
                    {request.status === 'aprobada' ? 'Aprobada' :
                     request.status === 'pendiente' ? 'Pendiente' : 'Rechazada'}
                  </span>
                  
                  {request.status === 'pendiente' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{
                        padding: '6px 12px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}>
                        Aprobar
                      </button>
                      <button style={{
                        padding: '6px 12px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}>
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ============ VISTA DE NÓMINAS ============
  const PayrollView = () => (
    <div>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
          Gestión de Nóminas - Febrero 2024
        </h3>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Total Bruto</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '8px 0 0 0' }}>
                €{(employees.reduce((sum, e) => sum + e.salary, 0) / 12).toLocaleString('es-ES', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div style={{
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Deducciones</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444', margin: '8px 0 0 0' }}>
                €{((employees.reduce((sum, e) => sum + e.salary, 0) / 12) * 0.2).toLocaleString('es-ES', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div style={{
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Total Neto</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', margin: '8px 0 0 0' }}>
                €{((employees.reduce((sum, e) => sum + e.salary, 0) / 12) * 0.8).toLocaleString('es-ES', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                Empleado
              </th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>
                Salario Base
              </th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>
                Bonificaciones
              </th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>
                Deducciones
              </th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>
                Neto
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                Estado
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.map(employee => {
              const monthSalary = employee.salary / 12;
              const deductions = monthSalary * 0.2;
              const net = monthSalary - deductions;
              
              return (
                <tr key={employee.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>
                        {employee.name}
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                        {employee.position}
                      </p>
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>
                    €{monthSalary.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>
                    €0
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#ef4444' }}>
                    -€{deductions.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>
                    €{net.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      backgroundColor: '#fef3c7',
                      color: '#92400e'
                    }}>
                      Pendiente
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button style={{
                      padding: '6px 12px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}>
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button style={{
            padding: '10px 20px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            backgroundColor: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Download style={{ height: '16px', width: '16px' }} />
            Exportar
          </button>
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Send style={{ height: '16px', width: '16px' }} />
            Procesar Nóminas
          </button>
        </div>
      </div>
    </div>
  );

  // ============ MODAL AÑADIR EMPLEADO ============
  const AddEmployeeModal = () => {
    if (!showAddEmployeeModal) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          width: '90%',
          maxWidth: '500px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
              Nuevo Empleado
            </h2>
            <button
              onClick={() => setShowAddEmployeeModal(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X style={{ height: '24px', width: '24px' }} />
            </button>
          </div>
          
          <form>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                Nombre Completo
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                Email
              </label>
              <input
                type="email"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                Cargo
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => setShowAddEmployeeModal(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Guardar Empleado
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ============ RENDER PRINCIPAL ============
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Tabs de navegación */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'employees', label: 'Empleados', icon: Users },
            { id: 'attendance', label: 'Asistencia', icon: Clock },
            { id: 'leaves', label: 'Ausencias', icon: Calendar },
            { id: 'payroll', label: 'Nóminas', icon: CreditCard }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '16px 24px',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
                fontWeight: activeTab === tab.id ? '600' : '400',
                fontSize: '14px'
              }}
            >
              <tab.icon style={{ height: '18px', width: '18px' }} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div style={{ padding: '0 24px 24px' }}>
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'employees' && <EmployeesView />}
        {activeTab === 'attendance' && <AttendanceView />}
        {activeTab === 'leaves' && <LeavesView />}
        {activeTab === 'payroll' && <PayrollView />}
      </div>

      {/* Modales */}
      <AddEmployeeModal />
    </div>
  );
};

export default HRManagementSystem;