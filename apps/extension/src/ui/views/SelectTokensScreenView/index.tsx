import { SelectTokensScreen } from '@onflow/frw-screens';

const SelectTokensScreenView = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        minHeight: '100%',
      }}
    >
      <SelectTokensScreen />
    </div>
  );
};

export default SelectTokensScreenView;
