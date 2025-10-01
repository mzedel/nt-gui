// Copyright 2022 Northern.tech AS
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
import type { CSSProperties, KeyboardEvent } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';

import { Search as SearchIcon } from '@mui/icons-material';
import { InputAdornment, TextField } from '@mui/material';

import { TIMEOUTS } from '@northern.tech/store/constants';
import { useDebounce } from '@northern.tech/utils/debouncehook';

import Loader from './Loader';

const endAdornment = (
  <InputAdornment position="end">
    <Loader show small style={{ marginTop: -10 }} />
  </InputAdornment>
);

const startAdornment = (
  <InputAdornment position="start">
    <SearchIcon color="disabled" fontSize="small" />
  </InputAdornment>
);

// due to search not working reliably for single letter searches, only start at 2
const MINIMUM_SEARCH_LENGTH = 2;

interface ControlledSearchProps {
  className?: string;
  isSearching: boolean;
  name?: string;
  onSearch: (term: string) => Promise<void>;
  placeholder?: string;
  style?: CSSProperties;
}

export const ControlledSearch = ({
  className = '',
  isSearching,
  name = 'search',
  onSearch,
  placeholder = 'Search devices',
  style = {}
}: ControlledSearchProps) => {
  const { control, watch } = useFormContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const focusLockRef = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined); // this + the above focusLock are needed to work around the focus being reassigned to the input field which would cause runaway search triggers
  const triggerDebounceRef = useRef(false); // this is needed to reject the search triggered through the recreation of the onSearch callback

  const searchValue = watch(name, '');

  const debouncedSearchTerm = useDebounce(searchValue, TIMEOUTS.debounceDefault);

  const focusAndLock = () => {
    focusLockRef.current = false;
    inputRef.current?.focus();
    clearTimeout(timer.current);
    triggerDebounceRef.current = false;
    timer.current = setTimeout(() => (focusLockRef.current = true), TIMEOUTS.oneSecond);
  };

  useEffect(
    () => () => {
      clearTimeout(timer.current);
    },
    []
  );

  useEffect(() => {
    if (debouncedSearchTerm.length < MINIMUM_SEARCH_LENGTH || triggerDebounceRef.current) {
      return;
    }
    triggerDebounceRef.current = true;
    onSearch(debouncedSearchTerm).then(focusAndLock);
  }, [debouncedSearchTerm, onSearch]);

  const onTriggerSearch = useCallback(
    ({ key }: KeyboardEvent<HTMLInputElement>) => {
      if (key === 'Enter' && (!debouncedSearchTerm || debouncedSearchTerm.length >= MINIMUM_SEARCH_LENGTH)) {
        onSearch(debouncedSearchTerm).then(focusAndLock);
      }
    },
    [debouncedSearchTerm, onSearch]
  );

  const onFocus = useCallback(() => {
    if (focusLockRef.current && debouncedSearchTerm.length >= MINIMUM_SEARCH_LENGTH) {
      onSearch(debouncedSearchTerm).then(focusAndLock);
    }
  }, [debouncedSearchTerm, onSearch]);

  const adornments = isSearching ? { startAdornment, endAdornment } : { startAdornment };
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          className={className}
          slotProps={{ input: adornments }}
          onKeyUp={onTriggerSearch}
          onFocus={onFocus}
          placeholder={placeholder}
          inputRef={inputRef}
          size="small"
          style={style}
          {...field}
        />
      )}
    />
  );
};

ControlledSearch.displayName = 'ConnectedSearch';

interface SearchProps extends Omit<ControlledSearchProps, 'onSearch'> {
  onSearch: (term: string, shouldTrigger: boolean) => Promise<void>;
  searchTerm?: string;
  trigger?: boolean;
}

const Search = (props: SearchProps) => {
  const { className = '', searchTerm, onSearch, trigger } = props;
  const methods = useForm({ mode: 'onChange', defaultValues: { search: searchTerm ?? '' } });
  const { handleSubmit } = methods;
  const onSubmit = useCallback((search: string) => onSearch(search, !trigger), [onSearch, trigger]);
  return (
    <FormProvider {...methods}>
      <form className={className} noValidate onSubmit={handleSubmit(({ search }) => onSearch(search, !trigger))}>
        <ControlledSearch {...props} onSearch={onSubmit} />
        <input className="hidden" type="submit" />
      </form>
    </FormProvider>
  );
};

export default Search;
