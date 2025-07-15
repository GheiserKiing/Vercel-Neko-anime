// File: NekoShop/frontend/src/components/admin/SuppliersTab.jsx
import React from 'react';
import axios from 'axios';

export default function SuppliersTab() {
  const supplierId = 9;

  const handleConnect = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/suppliersAuth/${supplierId}/auth`
      );
      window.location.href = data.oauthUrl;
    } catch (err) {
      console.error('Error obteniendo OAuth URL:', err);
      alert('No se pudo iniciar OAuth de AliExpress.');
    }
  };

  return (
    <div>
      <h2>Proveedores</h2>
      <button onClick={handleConnect}>
        Conectar AliExpress
      </button>
    </div>
  );
}
