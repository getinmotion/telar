import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

export const ProductEditPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();

  if (!productId) return <Navigate to="/inventario" replace />;

  return (
    <Navigate
      to={`/productos/subir?edit=true&productId=${productId}`}
      replace
    />
  );
};
