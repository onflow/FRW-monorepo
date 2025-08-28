import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

import { useAndroidTextFix } from '@/lib/androidTextFix';

import {
  ActionSheet,
  AlertModal,
  BaseModal,
  BottomModal,
  ConfirmModal,
  type ActionSheetItem,
} from './';
import { CopyIcon, InfoIcon, ScanIcon } from '../icons';

/**
 * Example usage of the new Modal components
 * This file demonstrates how to use all the Modal variants
 */
export const ModalExamples: React.FC = () => {
  const androidTextFix = useAndroidTextFix();

  // Modal visibility states
  const [showBase, setShowBase] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showBottom, setShowBottom] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);

  // Action sheet configuration
  const actionSheetItems: ActionSheetItem[] = [
    {
      id: 'copy',
      title: 'Copy Address',
      icon: <CopyIcon width={20} height={20} />,
      onPress: () => console.log('Copy pressed'),
    },
    {
      id: 'scan',
      title: 'Scan QR Code',
      icon: <ScanIcon width={20} height={20} />,
      onPress: () => console.log('Scan pressed'),
    },
    {
      id: 'info',
      title: 'View Details',
      icon: <InfoIcon width={20} height={20} />,
      onPress: () => console.log('Info pressed'),
    },
    {
      id: 'delete',
      title: 'Delete Account',
      destructive: true,
      onPress: () => console.log('Delete pressed'),
    },
    {
      id: 'disabled',
      title: 'Disabled Option',
      disabled: true,
      onPress: () => console.log('This should not be called'),
    },
  ];

  return (
    <View style={{ padding: 20, gap: 16 }}>
      <Text style={[androidTextFix, { fontSize: 18, fontWeight: 'bold', marginBottom: 16 }]}>
        Modal Examples
      </Text>

      {/* Trigger Buttons */}
      <TouchableOpacity
        onPress={() => setShowBase(true)}
        style={{ backgroundColor: '#3B82F6', padding: 12, borderRadius: 8 }}
      >
        <Text style={[androidTextFix, { color: 'white', textAlign: 'center' }]}>
          Show Base Modal
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setShowAlert(true)}
        style={{ backgroundColor: '#EF4444', padding: 12, borderRadius: 8 }}
      >
        <Text style={[androidTextFix, { color: 'white', textAlign: 'center' }]}>
          Show Alert Modal
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setShowConfirm(true)}
        style={{ backgroundColor: '#10B981', padding: 12, borderRadius: 8 }}
      >
        <Text style={[androidTextFix, { color: 'white', textAlign: 'center' }]}>
          Show Confirm Modal
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setShowBottom(true)}
        style={{ backgroundColor: '#8B5CF6', padding: 12, borderRadius: 8 }}
      >
        <Text style={[androidTextFix, { color: 'white', textAlign: 'center' }]}>
          Show Bottom Modal
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setShowActionSheet(true)}
        style={{ backgroundColor: '#F59E0B', padding: 12, borderRadius: 8 }}
      >
        <Text style={[androidTextFix, { color: 'white', textAlign: 'center' }]}>
          Show Action Sheet
        </Text>
      </TouchableOpacity>

      {/* Modals */}

      {/* Base Modal */}
      <BaseModal
        visible={showBase}
        onClose={() => setShowBase(false)}
        title="Custom Modal"
        showCloseButton={true}
        closeButtonPosition="header"
      >
        <Text style={[androidTextFix, { fontSize: 16, marginBottom: 16 }]}>
          This is a custom modal using the BaseModal component. You can put any content here.
        </Text>
        <TouchableOpacity
          onPress={() => setShowBase(false)}
          style={{
            backgroundColor: '#3B82F6',
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={[androidTextFix, { color: 'white', fontWeight: '600' }]}>Close Modal</Text>
        </TouchableOpacity>
      </BaseModal>

      {/* Alert Modal */}
      <AlertModal
        visible={showAlert}
        onClose={() => setShowAlert(false)}
        title="Error Occurred"
        message="Something went wrong while processing your request. Please try again later."
        alertType="error"
        buttonText="Got it"
      />

      {/* Confirm Modal */}
      <ConfirmModal
        visible={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          console.log('Confirmed!');
          setShowConfirm(false);
        }}
        title="Delete Account"
        message="Are you sure you want to delete this account? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonStyle="danger"
      />

      {/* Bottom Modal */}
      <BottomModal
        visible={showBottom}
        onClose={() => setShowBottom(false)}
        title="Bottom Sheet"
        showCloseButton={true}
      >
        <Text style={[androidTextFix, { fontSize: 16, marginBottom: 20 }]}>
          This is a bottom sheet modal that slides up from the bottom of the screen.
        </Text>
        <View style={{ gap: 12 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#F3F4F6',
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={[androidTextFix, { fontSize: 16 }]}>Option 1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: '#F3F4F6',
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={[androidTextFix, { fontSize: 16 }]}>Option 2</Text>
          </TouchableOpacity>
        </View>
      </BottomModal>

      {/* Action Sheet */}
      <ActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title="Account Actions"
        message="Choose an action for this account"
        actions={actionSheetItems}
        showCancel={true}
        cancelText="Cancel"
      />
    </View>
  );
};
