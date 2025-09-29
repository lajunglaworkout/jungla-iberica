import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import AccountingModule from '../../../../src/components/centers/AccountingModule';

// Mock de las dependencias
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

// Mock de los servicios
vi.mock('../../../../src/services/accountingService', () => ({
  accountingService: {
    getFinancialData: vi.fn().mockResolvedValue({
      id: '1',
      center_id: 'test-center-id',
      center_name: 'Test Center',
      mes: 9, // Septiembre
      año: 2025,
      cuotas: [],
      gastosExtras: [],
      clientes_altas: 0,
      clientes_bajas: 0,
      nutricion: 0,
      fisioterapia: 0,
      entrenamiento_personal: 0,
      entrenamientos_grupales: 0,
      otros: 0,
      alquiler: 0,
      suministros: 0,
      nominas: 0,
      seguridad_social: 0,
      marketing: 0,
      mantenimiento: 0,
      royalty: 0,
      software_gestion: 0,
    }),
    saveFinancialData: vi.fn().mockResolvedValue(true),
    getCuotaTypes: vi.fn().mockResolvedValue([
      { id: '1', nombre: 'Cuota Básica', precio: 40, lleva_iva: true },
      { id: '2', nombre: 'Cuota Premium', precio: 60, lleva_iva: true },
    ]),
    getHistoricalData: vi.fn().mockResolvedValue([]),
    getAvailableYears: vi.fn().mockResolvedValue([2024, 2025]),
  },
}));

describe('AccountingModule', () => {
  // Configuración inicial para las pruebas
  const defaultProps = {
    centerId: 'test-center-id',
    centerName: 'Test Center',
    onClose: vi.fn(),
    onBack: vi.fn(),
  };

  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    vi.clearAllMocks();
  });

  it('debe renderizar correctamente', async () => {
    render(<AccountingModule {...defaultProps} />);
    
    // Verificar que el componente se renderiza correctamente
    expect(await screen.findByText(/Contabilidad - Test Center/)).toBeInTheDocument();
    expect(screen.getByText('Gestión financiera mensual')).toBeInTheDocument();
  });

  it('debe permitir cambiar el mes y año', async () => {
    render(<AccountingModule {...defaultProps} />);
    
    // Esperar a que se cargue el componente
    await screen.findByText(/Contabilidad - Test Center/);
    
    // Obtener los selects de mes y año por su posición en el DOM
    const selects = screen.getAllByRole('combobox');
    const mesSelect = selects[0]; // Primer select es el mes
    const añoSelect = selects[1]; // Segundo select es el año
    
    // Cambiar los valores
    fireEvent.change(mesSelect, { target: { value: '5' } });
    fireEvent.change(añoSelect, { target: { value: '2023' } });
    
    // Verificar que los valores se actualizaron
    expect(mesSelect).toHaveValue('5');
    expect(añoSelect).toHaveValue('2023');
  });

  it('debe mostrar los contadores de clientes', async () => {
    render(<AccountingModule {...defaultProps} />);
    
    // Esperar a que se cargue el componente
    await screen.findByText(/Contabilidad - Test Center/);
    
    // Esperar a que se carguen los inputs
    const altasInput = await screen.findByPlaceholderText('Nuevos clientes');
    const bajasInput = await screen.findByPlaceholderText('Bajas de clientes');
    
    // Verificar que los elementos están presentes
    expect(altasInput).toBeInTheDocument();
    expect(bajasInput).toBeInTheDocument();
    
    // Verificar el texto del neto
    const netoText = await screen.findByText(/Neto:/);
    expect(netoText).toBeInTheDocument();
  });

  it('debe permitir actualizar los contadores de clientes', async () => {
    render(<AccountingModule {...defaultProps} />);
    
    // Esperar a que se cargue el componente
    await screen.findByText(/Contabilidad - Test Center/);
    
    // Obtener los inputs de altas y bajas
    const altasInput = await screen.findByPlaceholderText('Nuevos clientes');
    const bajasInput = await screen.findByPlaceholderText('Bajas de clientes');
    
    // Actualizar los valores
    fireEvent.change(altasInput, { target: { value: '10' } });
    fireEvent.change(bajasInput, { target: { value: '3' } });
    
    // Verificar que los valores se actualizaron
    expect(altasInput).toHaveValue(10);
    expect(bajasInput).toHaveValue(3);
    
    // Verificar que el neto se calcula correctamente
    const netoText = await screen.findByText(/Neto:.*7/);
    expect(netoText).toBeInTheDocument();
  });
});
