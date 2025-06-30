import React from 'react';
import { Routes, Route } from 'react-router';

import Forgot from './Forgot';
import Recover from './Forgot/Recover';
import Reset from './Forgot/Reset';
import Welcome from './Welcome';
import AccountImport from './Welcome/AccountImport';
import Register from './Welcome/Register';
import Sync from './Welcome/Sync';

import './Landing.css';

const LogPageView = () => {
  return null;
};

export const Landing: React.FC = () => {
  return (
    <div style={{ display: 'contents' }}>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/welcome/register" element={<Register />} />
        <Route path="/welcome/accountimport" element={<AccountImport />} />
        <Route path="/welcome/sync" element={<Sync />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/forgot/recover" element={<Recover />} />
        <Route path="/forgot/reset" element={<Reset />} />
      </Routes>
    </div>
  );
};
