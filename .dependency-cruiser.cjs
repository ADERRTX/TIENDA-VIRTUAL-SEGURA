module.exports = {
  'extends': 'dependency-cruiser:flat',
  'forbidden': [
    {
      'name': 'no-cross-module-imports',
      'comment': 'Los módulos de backend no deben importar repositorios de otro módulo',
      'severity': 'error',
      'from': { 'path': 'backend/src/modules' },
      'to': { 'path': 'backend/src/modules', 'pathNot': '^backend/src/modules/[^/]+/' }
    },
    {
      'name': 'no-cycles',
      'comment': 'No se permiten ciclos de importación',
      'severity': 'error',
      'from': {},
      'to': { 'circular': true }
    }
  ],
  'allowed': [
    { 'name': 'allowed-node-modules', 'comment': 'Módulos de Node.js permitidos', 'depTypes': ['npm'] }
  ]
};