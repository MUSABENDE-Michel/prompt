import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Recovery from './pages/Recovery';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import WarehouseList from './pages/WarehouseList';
import TransactionList from './pages/TransactionList';
import Reports from './pages/Reports';
import BillList from './pages/BillList';
import BillDetail from './pages/BillDetail';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/products" element={<Layout><ProductList /></Layout>} />
          <Route path="/warehouses" element={<Layout><WarehouseList /></Layout>} />
          <Route path="/transactions" element={<Layout><TransactionList /></Layout>} />
          <Route path="/reports" element={<Layout><Reports /></Layout>} />
          <Route path="/bills" element={<Layout><BillList /></Layout>} />
          <Route path="/bills/:id" element={<Layout><BillDetail /></Layout>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
