// src/components/logistics/logisticsData.ts
// Static reference data for logistics module

export const LOGISTICS_CENTERS = [
  { id: 'sevilla', name: 'Centro Sevilla', address: 'Calle Ejemplo 123, Sevilla' },
  { id: 'jerez', name: 'Centro Jerez', address: 'Av. Principal 456, Jerez de la Frontera' },
  { id: 'puerto', name: 'Centro Puerto', address: 'Plaza Mayor 789, El Puerto de Santa María' },
];

export const PRODUCTS_BY_CATEGORY: Record<string, Array<{ name: string; sizes: string[]; price: number }>> = {
  'Vestuario': [{ name: 'CHÁNDAL', sizes: ['S', 'M', 'L', 'XL'], price: 35.00 }, { name: 'SUDADERA FRÍO', sizes: ['S', 'M', 'L', 'XL'], price: 28.00 }, { name: 'CHALECO FRÍO', sizes: ['S', 'M', 'L', 'XL'], price: 25.00 }, { name: 'PANTALÓN CORTO', sizes: ['S', 'M', 'L', 'XL'], price: 20.00 }, { name: 'POLO VERDE', sizes: ['S', 'M', 'L', 'XL'], price: 18.00 }, { name: 'CAMISETA ENTRENAMIENTO PERSONAL', sizes: ['S', 'M', 'L', 'XL'], price: 15.00 }, { name: 'TOALLAS MICROFIBRA', sizes: ['70x140cm'], price: 8.50 }],
  'Mancuernas': [{ name: 'Mancuernas Hexagonales', sizes: ['1kg', '2kg', '3kg', '4kg', '5kg', '6kg', '7kg', '8kg', '9kg', '10kg'], price: 28.00 }, { name: 'Mancuernas Ajustables', sizes: ['5-25kg', '10-40kg'], price: 150.00 }],
  'Cardio': [{ name: 'Cinta de Correr', sizes: ['Profesional'], price: 2500.00 }, { name: 'Bicicleta Estática', sizes: ['Spinning', 'Reclinada'], price: 800.00 }, { name: 'Elíptica', sizes: ['Profesional'], price: 1200.00 }],
  'Gomas': [{ name: 'Gomas Elásticas', sizes: ['Resistencia Baja', 'Resistencia Media', 'Resistencia Alta'], price: 10.00 }, { name: 'Bandas de Resistencia', sizes: ['Set Completo'], price: 25.00 }],
  'Kettlebells': [{ name: 'Kettlebell', sizes: ['8kg', '12kg', '16kg', '20kg', '24kg', '28kg', '32kg'], price: 45.00 }],
  'Merchandising': [{ name: 'Botella La Jungla', sizes: ['500ml', '750ml', '1L'], price: 4.50 }, { name: 'Toalla La Jungla', sizes: ['Pequeña', 'Grande'], price: 12.00 }],
  'Consumibles': [{ name: 'Papel Higiénico', sizes: ['Pack 12 rollos'], price: 18.00 }, { name: 'Jabón de Manos', sizes: ['5L'], price: 15.00 }, { name: 'Desinfectante', sizes: ['1L', '5L'], price: 12.00 }],
  'Limpieza': [{ name: 'Desinfectante Virucida', sizes: ['1L', '5L'], price: 15.00 }, { name: 'Limpiador Multiusos', sizes: ['5L'], price: 12.00 }, { name: 'Bayetas Microfibra', sizes: ['Pack 10'], price: 8.00 }],
  'Discos': [{ name: 'Discos Olímpicos', sizes: ['1.25kg', '2.5kg', '5kg', '10kg', '15kg', '20kg', '25kg'], price: 35.00 }, { name: 'Discos Bumper', sizes: ['5kg', '10kg', '15kg', '20kg', '25kg'], price: 45.00 }],
  'Barras': [{ name: 'Barra Olímpica', sizes: ['20kg', '15kg'], price: 180.00 }, { name: 'Barra Funcional', sizes: ['10kg', '15kg'], price: 120.00 }, { name: 'Barra EZ', sizes: ['Estándar'], price: 85.00 }],
  'Pelotas': [{ name: 'Pelota Medicinal', sizes: ['3kg', '5kg', '7kg', '9kg', '10kg', '12kg', '15kg'], price: 35.00 }, { name: 'Pelota Pilates', sizes: ['55cm', '65cm', '75cm'], price: 15.00 }],
  'Sacos': [{ name: 'Saco Búlgaro', sizes: ['10kg', '15kg', '20kg', '25kg'], price: 65.00 }, { name: 'Saco de Arena', sizes: ['15kg', '20kg', '30kg'], price: 45.00 }],
  'Funcional': [{ name: 'TRX Suspension', sizes: ['Profesional', 'Home'], price: 180.00 }, { name: 'Bosu Ball', sizes: ['Estándar'], price: 150.00 }],
  'Accesorios': [{ name: 'Esterillas Yoga', sizes: ['6mm', '8mm', '10mm'], price: 25.00 }, { name: 'Rodillos Foam', sizes: ['30cm', '45cm', '60cm'], price: 18.00 }],
  'Instalaciones': [{ name: 'Espejo Gimnasio', sizes: ['1x2m', '2x3m'], price: 120.00 }, { name: 'Suelo Caucho', sizes: ['m²'], price: 35.00 }],
};
