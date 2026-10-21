// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';

import Button from '~components/button';
import Header from '~components/header';
import SpaceBetween from '~components/space-between';

import { SimplePage } from '../app/templates';

export default function ButtonActionPage() {
  const [lastAction, setLastAction] = useState('None');

  const onAction = (action: string) => () => setLastAction(action);

  return (
    <SimplePage title="Button: Action" subtitle={`Last action: ${lastAction}`} screenshotArea={{}}>
      <SpaceBetween size="l">
        <Header
          variant="h2"
          description="Primary, secondary, and tertiary actions in a page header."
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={onAction('Delete')}>Delete</Button>
              <Button onClick={onAction('Edit')}>Edit</Button>
              <Button variant="primary" onClick={onAction('Create')}>
                Create resource
              </Button>
            </SpaceBetween>
          }
        >
          Header actions
        </Header>

        <div>
          <h2>Form actions</h2>
          <SpaceBetween direction="horizontal" size="xs">
            <Button onClick={onAction('Cancel')}>Cancel</Button>
            <Button variant="primary" onClick={onAction('Save')}>
              Save
            </Button>
          </SpaceBetween>
        </div>

        <div>
          <h2>Icon actions</h2>
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="icon" iconName="refresh" ariaLabel="Refresh" onClick={onAction('Refresh')} />
            <Button variant="icon" iconName="settings" ariaLabel="Settings" onClick={onAction('Settings')} />
            <Button variant="icon" iconName="ellipsis" ariaLabel="More actions" onClick={onAction('More actions')} />
            <Button variant="inline-icon" iconName="copy" ariaLabel="Copy" onClick={onAction('Copy')} />
          </SpaceBetween>
        </div>

        <div>
          <h2>Disabled and loading</h2>
          <SpaceBetween direction="horizontal" size="xs">
            <Button disabled={true}>Disabled</Button>
            <Button disabled={true} disabledReason="You do not have permission to perform this action">
              Disabled with reason
            </Button>
            <Button loading={true} loadingText="Saving">
              Saving
            </Button>
            <Button variant="primary" loading={true} loadingText="Creating">
              Creating
            </Button>
          </SpaceBetween>
        </div>
      </SpaceBetween>
    </SimplePage>
  );
}
