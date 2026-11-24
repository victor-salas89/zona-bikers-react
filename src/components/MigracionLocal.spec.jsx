import { it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MigracionLocal from './MigracionLocal';
import { simularApi } from '../test/apiSimulada';

it('importa registros nuevos y conserva conflictos sin enviar contraseñas antiguas', async () => {
  const simulacion = simularApi([{ id: 1, codigo: 'EXISTE' }]);
  localStorage.setItem('productosBikers', JSON.stringify([{ codigo: 'EXISTE' }, { codigo: 'NUEVO', nombre: 'Nuevo', precio: 1000 }]));
  localStorage.setItem('usuariosBikers', JSON.stringify([{ correo: 'nuevo@gmail.com', rol: 'cliente', contrasena: 'vieja' }, { correo: 'admin@duoc.cl' }]));
  render(<MigracionLocal />);
  fireEvent.change(screen.getByLabelText('Nueva contraseña para las cuentas importadas'), { target: { value: 'ClaveNueva123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Importar registros pendientes' }));
  const resultado = await screen.findByRole('status');
  expect(resultado.textContent).toContain('importado'); expect(resultado.textContent).toContain('ya existe');
  expect(JSON.parse(localStorage.getItem('productosBikers'))).toEqual([{ codigo: 'EXISTE' }]);
  expect(JSON.parse(localStorage.getItem('usuariosBikers'))).toEqual([{ correo: 'admin@duoc.cl' }]);
  expect(simulacion.estado.usuarios.at(-1).contrasena).toBe('ClaveNueva123');
  expect(JSON.stringify(simulacion.fetch.mock.calls)).not.toContain('vieja');
});

it('conserva datos si falta contraseña o la API falla y permite reintentar', async () => {
  const simulacion = simularApi();
  localStorage.setItem('usuariosBikers', JSON.stringify([{ correo: 'nuevo@gmail.com' }]));
  render(<MigracionLocal />);
  fireEvent.click(screen.getByRole('button', { name: 'Importar registros pendientes' }));
  expect((await screen.findByRole('status')).textContent).toContain('ingresa una nueva contraseña');
  expect(JSON.parse(localStorage.getItem('usuariosBikers'))).toHaveLength(1);
  simulacion.fetch.mockRejectedValue(new Error('sin red'));
  fireEvent.click(screen.getByRole('button', { name: 'Importar registros pendientes' }));
  expect(await screen.findByText(/No se pudo conectar/)).toBeTruthy();
});
