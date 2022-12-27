import React, { useEffect, useState } from 'react';

import { IconButton } from '@twilio/flex-ui';
import { Box } from '@twilio-paste/core/box';
import { Combobox } from '@twilio-paste/core/combobox';
import { Flex } from '@twilio-paste/core/flex';
import { Stack } from '@twilio-paste/core/stack';
import { Text } from '@twilio-paste/core/text';
import { makeInternalCall } from '../../helpers/internalCall';
import { debounce } from 'lodash';

const InternalDialpad = (props) => {
  const [inputText, setInputText] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workerList, setWorkerList] = useState([]);

  useEffect(() => {
    setWorkers();
  }, []);

  useEffect(() => {
    handleWorkersListUpdate(inputText);

    if (selectedWorker && inputText !== selectedWorker.attributes.full_name) {
      setSelectedWorker(null);
    }
  }, [inputText]);

  const setWorkers = (query = '') => {
    const { contact_uri: worker_contact_uri } =
      props.manager.workerClient.attributes;

    props.manager.insightsClient.instantQuery('tr-worker').then((q) => {
      q.on('searchResult', (items) => {
        const initialList = Object.keys(items).map(
          (workerSid) => items[workerSid]
        );
        const availableList = initialList.filter(
          (worker) => worker.activity_name !== 'Offline'
        );
        setWorkerList(availableList);
      });

      q.search(
        `data.attributes.contact_uri != "${worker_contact_uri}"${
          query !== '' ? ` AND ${query}` : ''
        }`
      );
    });
  };

  const selectWorker = (event) => {
    setSelectedWorker(event);
  };

  const handleInput = (inputValue) => {
    setInputText(inputValue);
  };

  const handleWorkersListUpdate = debounce(
    (e) => {
      if (e) {
        setWorkers(`data.attributes.full_name CONTAINS "${e}"`);
      }
    },
    250,
    { maxWait: 1000 }
  );

  const handleOpenChange = (e) => {
    if (e.isOpen === true && inputText === '' && workerList.length === 0) {
      setWorkers();
    }
  };

  const makeCall = () => {
    if (selectedWorker != null) {
      const { manager } = props;

      makeInternalCall({
        manager,
        selectedWorker: selectedWorker,
      });
    }
  };

  return (
    <Box
      borderTopWidth="borderWidth10"
      borderTopColor="colorBorder"
      borderTopStyle="solid"
      marginTop="space80"
      paddingTop="space80"
      paddingBottom="230px"
      width="100%"
    >
      <Stack orientation="vertical" spacing="space60">
        <Text as="span" fontSize="fontSize60" fontWeight="fontWeightBold">
          Call Agent
        </Text>
        <Combobox
          autocomplete
          items={workerList}
          inputValue={inputText}
          itemToString={(item) => item.attributes.full_name}
          labelText="Select an agent"
          onInputValueChange={({ inputValue }) => handleInput(inputValue)}
          onIsOpenChange={handleOpenChange}
          onSelectedItemChange={({ selectedItem }) =>
            selectWorker(selectedItem)
          }
          optionTemplate={(item) => <>{item.attributes.full_name}</>}
        />
        <Flex hAlignContent="center">
          <IconButton
            variant="primary"
            icon="Call"
            disabled={!selectedWorker}
            onClick={makeCall}
          />
        </Flex>
      </Stack>
    </Box>
  );
};

export default InternalDialpad;
