import { useCallback, useState } from 'react';

import { UpdateService } from '../utils/updateService';
import { Button } from './ui/forms/button';

export const UpdateButton = () => {
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckForUpdates = useCallback(async () => {
    setIsChecking(true);
    try {
      const hasUpdate = await UpdateService.checkForUpdates();
      if (!hasUpdate) {
        // Show "No updates available" message if needed
        console.log('No updates available');
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  return (
    <Button onPress={handleCheckForUpdates} disabled={isChecking} variant="outline">
      {isChecking ? 'Checking...' : 'Check for Updates'}
    </Button>
  );
};
