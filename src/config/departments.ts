// Configuración de departamentos y responsables de La Jungla
export interface DepartmentConfig {
  id: string;
  name: string;
  icon: string;
  responsibleEmail: string;
  responsibleName: string;
  description: string;
  canCreateMeetings: boolean; // Si puede crear reuniones
  meetingScope: 'all' | 'department' | 'center'; // Alcance de reuniones que puede crear
}

export interface CenterEmployee {
  id: string;
  name: string;
  position: string;
  email: string;
  role: 'manager' | 'employee';
  canCreateMeetings: boolean; // Si puede crear reuniones
  meetingScope: 'all' | 'department' | 'center'; // Alcance de reuniones que puede crear
}

export interface CenterConfig {
  id: string;
  name: string;
  icon: string;
  location: string;
  employees: CenterEmployee[];
}

export type AssignmentType = 'corporativo' | 'centro';

export const DEPARTMENTS: DepartmentConfig[] = [
  {
    id: 'direccion',
    name: 'Dirección',
    icon: '🏢',
    responsibleEmail: 'carlossuarezparra@gmail.com',
    responsibleName: 'Carlos Suárez',
    description: 'Dirección general y toma de decisiones estratégicas',
    canCreateMeetings: true,
    meetingScope: 'all' // CEO puede crear reuniones con cualquiera
  },
  {
    id: 'rrhh',
    name: 'RRHH y Procedimientos',
    icon: '👥',
    responsibleEmail: 'rrhhlajungla@gmail.com',
    responsibleName: 'Vicente (RRHH)',
    description: 'Recursos humanos, procedimientos y gestión de personal',
    canCreateMeetings: true,
    meetingScope: 'all' // RRHH puede reunirse con todos los empleados
  },
  {
    id: 'logistica',
    name: 'Logística',
    icon: '📦',
    responsibleEmail: 'pedidoslajungla@gmail.com',
    responsibleName: 'Equipo Logística',
    description: 'Gestión de inventario, pedidos y suministros',
    canCreateMeetings: true,
    meetingScope: 'department' // Solo con su departamento y centros
  },
  {
    id: 'contabilidad',
    name: 'Contabilidad y Ventas',
    icon: '💰',
    responsibleEmail: 'lajunglacentral@gmail.com',
    responsibleName: 'Equipo Contabilidad',
    description: 'Gestión financiera, contabilidad y ventas',
    canCreateMeetings: true,
    meetingScope: 'department' // Solo con su departamento y centros
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: '📱',
    responsibleEmail: 'lajunglaworkoutmk@gmail.com',
    responsibleName: 'Equipo Marketing',
    description: 'Marketing digital, contenido y comunicación',
    canCreateMeetings: true,
    meetingScope: 'department' // Solo con su departamento y centros
  },
  {
    id: 'eventos',
    name: 'Eventos',
    icon: '🎉',
    responsibleEmail: 'lajunglaweeventos@gmail.com',
    responsibleName: 'Equipo Eventos',
    description: 'Organización y gestión de eventos',
    canCreateMeetings: true,
    meetingScope: 'department' // Solo con su departamento y centros
  },
  {
    id: 'online',
    name: 'Online',
    icon: '💻',
    responsibleEmail: 'lajunglawonline@gmail.com',
    responsibleName: 'Equipo Online',
    description: 'Plataformas digitales y servicios online',
    canCreateMeetings: true,
    meetingScope: 'department' // Solo con su departamento y centros
  },
  {
    id: 'id',
    name: 'I+D',
    icon: '🔬',
    responsibleEmail: 'beni.jungla@gmail.com',
    responsibleName: 'Beni (I+D)',
    description: 'Investigación, desarrollo e innovación',
    canCreateMeetings: true,
    meetingScope: 'department' // Solo con su departamento y centros
  }
];

// Configuración de centros con empleados reales
export const CENTERS: CenterConfig[] = [
  {
    id: 'sevilla',
    name: 'Sevilla',
    icon: '🏪',
    location: 'Sevilla Centro',
    employees: [
      {
        id: 'francisco-giraldez',
        name: 'Francisco Giráldez',
        position: 'Encargado de Centro',
        email: 'francisco.giraldez@lajungla.com',
        role: 'manager',
        canCreateMeetings: true,
        meetingScope: 'center' // Puede crear reuniones con su equipo del centro
      },
      {
        id: 'salvador-cabrera',
        name: 'Salvador Cabrera',
        position: 'Segundo Encargado',
        email: 'salvador.cabrera@lajungla.com',
        role: 'manager',
        canCreateMeetings: true,
        meetingScope: 'center' // Puede crear reuniones con su equipo del centro
      },
      {
        id: 'javier-surian',
        name: 'Javier Surián',
        position: 'Entrenador',
        email: 'javier.surian@lajungla.com',
        role: 'employee',
        canCreateMeetings: false,
        meetingScope: 'center' // Solo puede participar, no crear
      },
      {
        id: 'jesus-arias',
        name: 'Jesús Arias',
        position: 'Entrenador',
        email: 'jesus.arias@lajungla.com',
        role: 'employee',
        canCreateMeetings: false,
        meetingScope: 'center' // Solo puede participar, no crear
      },
      {
        id: 'jesus-rosado',
        name: 'Jesús Rosado',
        position: 'Entrenador',
        email: 'jesus.rosado@lajungla.com',
        role: 'employee',
        canCreateMeetings: false,
        meetingScope: 'center' // Solo puede participar, no crear
      },
      {
        id: 'santiago-frias',
        name: 'Santiago Frías',
        position: 'Entrenador',
        email: 'santiago.frias@lajungla.com',
        role: 'employee',
        canCreateMeetings: false,
        meetingScope: 'center' // Solo puede participar, no crear
      }
    ]
  },
  {
    id: 'jerez',
    name: 'Jerez',
    icon: '🏪',
    location: 'Jerez de la Frontera',
    employees: [
      {
        id: 'encargado-jerez',
        name: 'Encargado Jerez',
        position: 'Encargado de Centro',
        email: 'jerez@lajungla.com',
        role: 'manager',
        canCreateMeetings: true,
        meetingScope: 'center' // Puede crear reuniones con su equipo del centro
      }
    ]
  },
  {
    id: 'puerto',
    name: 'Puerto de Santa María',
    icon: '🏪',
    location: 'El Puerto de Santa María',
    employees: [
      {
        id: 'encargado-puerto',
        name: 'Encargado Puerto',
        position: 'Encargado de Centro',
        email: 'puerto@lajungla.com',
        role: 'manager',
        canCreateMeetings: true,
        meetingScope: 'center' // Puede crear reuniones con su equipo del centro
      }
    ]
  }
];

// Función para obtener departamento por nombre
export const getDepartmentByName = (name: string): DepartmentConfig | undefined => {
  return DEPARTMENTS.find(dept => dept.name === name);
};

// Función para obtener responsable de un departamento
export const getDepartmentResponsible = (departmentName: string): { email: string; name: string } | null => {
  const dept = getDepartmentByName(departmentName);
  if (!dept) return null;
  
  return {
    email: dept.responsibleEmail,
    name: dept.responsibleName
  };
};

// Función para obtener centro por ID
export const getCenterById = (centerId: string): CenterConfig | undefined => {
  return CENTERS.find(center => center.id === centerId);
};

// Función para obtener empleado por ID
export const getEmployeeById = (employeeId: string): { employee: CenterEmployee; center: CenterConfig } | null => {
  for (const center of CENTERS) {
    const employee = center.employees.find(emp => emp.id === employeeId);
    if (employee) {
      return { employee, center };
    }
  }
  return null;
};

// Función para obtener responsable por tipo de asignación
export const getAssignmentResponsible = (
  assignmentType: AssignmentType,
  assignmentId: string
): { email: string; name: string; description: string } | null => {
  if (assignmentType === 'corporativo') {
    const dept = getDepartmentResponsible(assignmentId);
    if (!dept) return null;
    
    return {
      email: dept.email,
      name: dept.name,
      description: `Departamento: ${assignmentId}`
    };
  } else {
    const employeeData = getEmployeeById(assignmentId);
    if (!employeeData) return null;
    
    return {
      email: employeeData.employee.email,
      name: employeeData.employee.name,
      description: `${employeeData.employee.position} - ${employeeData.center.name}`
    };
  }
};

// Función para verificar si un usuario puede crear reuniones
export const canUserCreateMeetings = (userEmail: string): boolean => {
  // Verificar en departamentos
  const department = DEPARTMENTS.find(dept => dept.responsibleEmail === userEmail);
  if (department) {
    return department.canCreateMeetings;
  }

  // Verificar en empleados de centros
  for (const center of CENTERS) {
    const employee = center.employees.find(emp => emp.email === userEmail);
    if (employee) {
      return employee.canCreateMeetings;
    }
  }

  return false; // Por defecto no puede crear reuniones
};

// Función para obtener el alcance de reuniones de un usuario
export const getUserMeetingScope = (userEmail: string): 'all' | 'department' | 'center' | null => {
  // Verificar en departamentos
  const department = DEPARTMENTS.find(dept => dept.responsibleEmail === userEmail);
  if (department && department.canCreateMeetings) {
    return department.meetingScope;
  }

  // Verificar en empleados de centros
  for (const center of CENTERS) {
    const employee = center.employees.find(emp => emp.email === userEmail);
    if (employee && employee.canCreateMeetings) {
      return employee.meetingScope;
    }
  }

  return null;
};

// Función para obtener opciones de asignación disponibles según el usuario
export const getAvailableAssignmentOptions = (userEmail: string) => {
  const scope = getUserMeetingScope(userEmail);
  if (!scope) return { departments: [], centers: [], employees: [] };

  let availableDepartments: DepartmentConfig[] = [];
  let availableCenters: CenterConfig[] = [];
  let availableEmployees: (CenterEmployee & { centerName: string })[] = [];

  switch (scope) {
    case 'all':
      // Puede asignar a cualquier departamento o empleado
      availableDepartments = DEPARTMENTS;
      availableCenters = CENTERS;
      availableEmployees = CENTERS.flatMap(center => 
        center.employees.map(emp => ({ ...emp, centerName: center.name }))
      );
      break;

    case 'department':
      // Solo puede asignar dentro de su departamento y a centros
      const userDept = DEPARTMENTS.find(dept => dept.responsibleEmail === userEmail);
      if (userDept) {
        availableDepartments = [userDept];
      }
      availableCenters = CENTERS;
      availableEmployees = CENTERS.flatMap(center => 
        center.employees.filter(emp => emp.role === 'manager').map(emp => ({ ...emp, centerName: center.name }))
      );
      break;

    case 'center':
      // Solo puede asignar dentro de su centro
      const userCenter = CENTERS.find(center => 
        center.employees.some(emp => emp.email === userEmail)
      );
      if (userCenter) {
        availableCenters = [userCenter];
        availableEmployees = userCenter.employees.map(emp => ({ ...emp, centerName: userCenter.name }));
      }
      break;
  }

  return {
    departments: availableDepartments,
    centers: availableCenters,
    employees: availableEmployees
  };
};

// Función para crear alerta de reunión
export const createMeetingAlert = (
  meetingTitle: string,
  meetingDate: string,
  meetingTime: string,
  department: string,
  agenda?: string
) => {
  const responsible = getDepartmentResponsible(department);
  if (!responsible) return null;

  return {
    id: `meeting-${Date.now()}`,
    title: `Nueva Reunión: ${meetingTitle}`,
    description: `Se ha programado una reunión para ${department} el ${meetingDate} a las ${meetingTime}. ${agenda ? `Agenda: ${agenda}` : ''}`,
    type: 'info' as const,
    priority: 'high' as const,
    createdAt: new Date().toISOString(),
    isRead: false,
    actionRequired: true,
    dueDate: `${meetingDate}T${meetingTime}:00.000Z`,
    targetEmail: responsible.email,
    targetName: responsible.name,
    department: department
  };
};
