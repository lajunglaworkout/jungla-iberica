import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AccountingModule from '../../../../src/components/centers/AccountingModule';

// Mock de las dependencias
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

describe('AccountingModule', () => {
  // Configuración inicial para las pruebas
  const defaultProps = {
    centerId: 'test-center-id',
    centerName: 'Test Center',
    onClose: vi.fn(),
  };

  it('debe renderizar correctamente', () => {
    render(<AccountingModule {...defaultProps} />);
    
    // Verificar que el componente se renderiza correctamente
    expect(screen.getByText('Módulo de Contabilidad')).toBeInTheDocument();
    expect(screen.getByText('Test Center')).toBeInTheDocument();
  });

  it('debe permitir cambiar el mes y año', () => {
    render(<AccountingModule {...defaultProps} />);
    
    // Obtener los inputs de mes y año
    const mesInput = screen.getByLabelText('Mes');
    const añoInput = screen.getByLabelText('Año');
    
    // Cambiar los valores
    fireEvent.change(mesInput, { target: { value: '5' } });
    fireEvent.change(añoInput, { target: { value: '2023' } });
    
    // Verificar que los valores se actualizaron
    expect(mesInput).toHaveValue(5);
    expect(añoInput).toHaveValue(2023);
  });

  it('debe permitir agregar una cuota', () => {
    render(<AccountingModule {...defaultProps} />);
    
    // Hacer clic en el botón de agregar cuota
    const addButton = screen.getByText('Añadir Cuota');
    fireEvent.click(addButton);
    
    // Verificar que se agregó una fila de cuota
    const cuotaRows = screen.getAllByRole('row');
    expect(cuotaRows.length).toBeGreaterThan(1); // 1 para el encabezado + al menos una fila
  });

  // Agrega más pruebas según sea necesario
});
