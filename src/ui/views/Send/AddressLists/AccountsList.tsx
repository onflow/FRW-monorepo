import { List, ListSubheader, ButtonBase, Box } from '@mui/material';
import { isEmpty } from 'lodash';
import React from 'react';

import { LLContactCard, LLContactEth, FWContactCard } from '@/ui/FRWComponent';
import { useContacts } from '@/ui/hooks/useContactHook';

const AccountsList = ({ filteredContacts, isLoading, handleClick, isSend = true }) => {
  const { addressBookContacts, cadenceAccounts, evmAccounts, childAccounts } = useContacts();

  return (
    <Box sx={{ height: '100%' }}>
      {!isEmpty(addressBookContacts) &&
        addressBookContacts.map((eachgroup, index) => (
          <List dense={false} sx={{ paddingTop: '0px', paddingBottom: '0px' }} key={index}>
            <Box>
              <ButtonBase
                key={`card-${index}`}
                sx={{ display: 'contents' }}
                onClick={() => handleClick(eachgroup)}
              >
                <FWContactCard contact={eachgroup} hideCloseButton={true} key={index} />
              </ButtonBase>
            </Box>
          </List>
        ))}
      {(!isEmpty(evmAccounts) || !isEmpty(childAccounts)) && (
        <ListSubheader
          sx={{
            lineHeight: '18px',
            marginTop: '0px',
            marginBottom: '0px',
            backgroundColor: '#000000',
            textTransform: 'capitalize',
            py: '4px',
          }}
        >
          {chrome.i18n.getMessage('Linked_Account')}
        </ListSubheader>
      )}
      {!isEmpty(evmAccounts) &&
        evmAccounts.map((eachgroup, index) => (
          <List dense={false} sx={{ paddingTop: '0px', paddingBottom: '0px' }} key={index}>
            <Box>
              <ButtonBase
                key={`card-${index}`}
                sx={{ display: 'contents' }}
                onClick={() => handleClick(eachgroup)}
              >
                <LLContactEth contact={eachgroup} hideCloseButton={true} key={index} />
              </ButtonBase>
            </Box>
          </List>
        ))}

      {!isEmpty(childAccounts) &&
        childAccounts.map((eachgroup, index) => (
          <List dense={false} sx={{ paddingTop: '0px', paddingBottom: '0px' }} key={index}>
            <Box>
              <ButtonBase
                key={`card-${index}`}
                sx={{ display: 'contents' }}
                onClick={() => handleClick(eachgroup)}
              >
                <LLContactCard contact={eachgroup} hideCloseButton={true} key={index} />
              </ButtonBase>
            </Box>
          </List>
        ))}
    </Box>
  );
};

export default AccountsList;
