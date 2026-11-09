import type React from 'react';

export interface NavItem {
  to: string;
  label: string;
  end?: boolean;
  icon?: React.ReactNode;
}
