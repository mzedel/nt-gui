// Copyright 2025 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
//@ts-nocheck
import { act, queryByRole, waitFor, within } from '@testing-library/react';
import { expect } from 'vitest';

export const selectMaterialUiSelectOption = async (element, optionText, user) => {
  // The button that opens the dropdown, which is a sibling of the input
  const selectButton = element.parentNode.querySelector('[role=combobox]');
  // Open the select dropdown
  await act(async () => await user.click(selectButton));
  // Get the dropdown element. We don't use getByRole() because it includes <select>s too.
  const listbox = queryByRole(document.documentElement, 'listbox');
  // Click the list item
  const listItem = within(listbox!).getByText(optionText);
  await user.click(listItem);
  // Wait for the listbox to be removed, so it isn't visible in subsequent calls
  await waitFor(() => expect(queryByRole(document.documentElement, 'listbox')).not.toBeInTheDocument());
  return Promise.resolve();
};
