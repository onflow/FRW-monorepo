import { useState, useEffect } from 'react';

import { type KeyInfo } from '../services/passkey-service';

interface SimpleWalletDashboardProps {
  keyInfo: KeyInfo;
  credentialId: string;
  onLogout: () => void;
}

export function SimpleWalletDashboard({
  keyInfo,
  credentialId,
  onLogout,
}: SimpleWalletDashboardProps) {
  const [balance, setBalance] = useState<string>('100.0');
  const [address, setAddress] = useState<string>('');

  // Send Flow states
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Generate a mock address for demo
    const mockAddress = '0x' + Math.random().toString(16).substr(2, 16).padStart(16, '0');
    setAddress(mockAddress);

    // Store in localStorage for persistence
    localStorage.setItem(`flow-address-${credentialId}`, mockAddress);
  }, [credentialId]);

  const handleSendFlow = async () => {
    if (!recipient || !amount) return;

    setIsSending(true);
    setError('');

    try {
      // Mock transaction for demo
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newBalance = (parseFloat(balance) - parseFloat(amount)).toFixed(1);
      setBalance(newBalance);

      setRecipient('');
      setAmount('');

      alert(`✅ Transaction successful!\nSent ${amount} FLOW to ${recipient}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Transaction failed');
    } finally {
      setIsSending(false);
    }
  };

  // Dark theme colors
  const theme = {
    bg: '#0C0C0C',
    cardBg: '#1A1A1A',
    primary: '#00D4AA',
    success: '#22C55E',
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
    border: '#2A2A2A',
    error: '#EF4444',
  };

  const cardStyle = {
    backgroundColor: theme.cardBg,
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
  };

  return (
    <div
      style={{
        padding: '32px',
        maxWidth: '600px',
        width: '100%',
        color: theme.text,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}
      >
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>🌊 Flow Wallet</h2>
        <button
          onClick={onLogout}
          style={{
            backgroundColor: 'transparent',
            color: theme.textSecondary,
            border: `1px solid ${theme.border}`,
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Logout
        </button>
      </div>

      {/* Account Info */}
      <div style={cardStyle}>
        <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>💼 Account Information</h3>
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontWeight: '600' }}>Address:</span>
            <span
              style={{
                fontFamily: 'Monaco, "Fira Code", monospace',
                fontSize: '12px',
                color: theme.textSecondary,
              }}
            >
              {address}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontWeight: '600' }}>Balance:</span>
            <span
              style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: theme.success,
              }}
            >
              {balance} FLOW
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontWeight: '600' }}>Keys:</span>
            <span>1 key</span>
          </div>
        </div>
      </div>

      {/* Send Flow */}
      <div style={cardStyle}>
        <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>💸 Send Flow</h3>

        {error && (
          <div
            style={{
              color: theme.error,
              fontSize: '14px',
              marginBottom: '16px',
              padding: '8px',
              backgroundColor: theme.error + '20',
              borderRadius: '4px',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
            }}
          >
            Recipient Address
          </label>
          <input
            type="text"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={isSending}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: theme.bg,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.text,
              fontSize: '14px',
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
            }}
          >
            Amount (FLOW)
          </label>
          <input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isSending}
            step="0.1"
            min="0"
            max={balance}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: theme.bg,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.text,
              fontSize: '14px',
            }}
          />
        </div>

        <button
          onClick={handleSendFlow}
          disabled={!recipient || !amount || isSending}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor:
              !recipient || !amount || isSending ? theme.textSecondary : theme.success,
            color: theme.bg,
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: !recipient || !amount || isSending ? 'not-allowed' : 'pointer',
            opacity: !recipient || !amount || isSending ? 0.6 : 1,
          }}
        >
          {isSending ? '🔄 Sending...' : '💸 Send Flow'}
        </button>
      </div>

      {/* Passkey Info */}
      <div style={cardStyle}>
        <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>🔑 Passkey Information</h3>
        <div style={{ fontSize: '14px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontWeight: '600' }}>Type:</span>
            <span>{keyInfo.type}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontWeight: '600' }}>Algorithm:</span>
            <span>
              {keyInfo.signAlgo} / {keyInfo.hashAlgo}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <span style={{ fontWeight: '600' }}>Key Index:</span>
            <span>{keyInfo.keyIndex}</span>
          </div>
          <div>
            <p style={{ fontWeight: '600', marginBottom: '4px' }}>Public Key:</p>
            <p
              style={{
                fontFamily: 'Monaco, "Fira Code", monospace',
                fontSize: '11px',
                wordBreak: 'break-all',
                color: theme.textSecondary,
                backgroundColor: theme.bg,
                padding: '8px',
                borderRadius: '4px',
              }}
            >
              {keyInfo.publicKey}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
