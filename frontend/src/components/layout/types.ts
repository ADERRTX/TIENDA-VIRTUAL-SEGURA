// [PARTE VISUAL / TIPOS: Definiciones de Navegación y Cabecera] Interfaces de TypeScript para elementos del menú, enlaces de navegación, rutas y propiedades de cabecera/footer.
import type React from 'react';

export interface NavItem {
  to: string;
  label: string;
  end?: boolean;
  icon?: React.ReactNode;
}
