import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../atoms/Button';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <h1 className="text-9xl font-bold text-primary-500">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mt-8 dark:text-gray-200">Página no encontrada</h2>
      <p className="text-gray-600 mt-4 max-w-md dark:text-gray-400">
        Lo sentimos, pero la página que estás buscando no existe o ha sido movida.
      </p>
      <div className="mt-8">
        <Link to="/">
          <Button variant="primary" size="lg">
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 