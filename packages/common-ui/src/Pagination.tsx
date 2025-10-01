// Copyright 2019 Northern.tech AS
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
import type { ReactNode } from 'react';
import { memo, useEffect, useState } from 'react';

import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { IconButton, TablePagination } from '@mui/material';

import { DEVICE_LIST_DEFAULTS, DEVICE_LIST_MAXIMUM_LENGTH, TIMEOUTS } from '@northern.tech/store/constants';
import { useDebounce } from '@northern.tech/utils/debouncehook';

import MenderTooltip from './helptips/MenderTooltip';

const defaultRowsPerPageOptions = [10, 20, DEVICE_LIST_MAXIMUM_LENGTH];
const { perPage: defaultPerPage } = DEVICE_LIST_DEFAULTS;
const paginationIndex = 1;
const paginationLimit = 10000;

const MaybeWrapper = ({ children, disabled }: { children: ReactNode; disabled: boolean }) =>
  disabled ? (
    <MenderTooltip arrow placement="top" title="Please refine your filter criteria first in order to proceed.">
      <div>{children}</div>
    </MenderTooltip>
  ) : (
    <div>{children}</div>
  );

interface TablePaginationActionsProps {
  count: number;
  onPageChange: (page: number) => void;
  page?: number;
  rowsPerPage?: number;
  showCountInfo?: boolean;
}

export const TablePaginationActions = ({ count, page = 0, onPageChange, rowsPerPage = defaultPerPage, showCountInfo = true }: TablePaginationActionsProps) => {
  const [pageNo, setPageNo] = useState(page + paginationIndex);

  useEffect(() => {
    setPageNo(page + paginationIndex);
  }, [page, rowsPerPage, count]);

  const debouncedPage = useDebounce(pageNo, TIMEOUTS.debounceShort);

  useEffect(() => {
    const newPage = Math.min(Math.max(paginationIndex, debouncedPage), Math.max(paginationIndex, Math.ceil(count / rowsPerPage)));
    if (newPage !== page + paginationIndex) {
      onPageChange(newPage);
    }
  }, [count, debouncedPage, onPageChange, page, rowsPerPage]);

  const pages = Math.ceil(count / rowsPerPage);

  const isAtPaginationLimit = pageNo >= paginationLimit / rowsPerPage;
  return (
    <div className="flexbox center-aligned">
      {showCountInfo && <div>{`${(pageNo - paginationIndex) * rowsPerPage + 1}-${Math.min(pageNo * rowsPerPage, count)} of ${count}`}</div>}
      <IconButton onClick={() => setPageNo(pageNo - 1)} disabled={pageNo === paginationIndex} size="large" aria-label="prev">
        <KeyboardArrowLeft />
      </IconButton>
      <MaybeWrapper disabled={isAtPaginationLimit}>
        <IconButton onClick={() => setPageNo(pageNo + 1)} disabled={pageNo >= pages || isAtPaginationLimit} size="large" aria-label="next">
          <KeyboardArrowRight />
        </IconButton>
      </MaybeWrapper>
    </div>
  );
};

interface PaginationProps {
  className?: string;
  count: number;
  disabled?: boolean;
  onChangePage: (page: number) => void;
  onChangeRowsPerPage: (value: number) => void;
  page?: number;
  rowsPerPage: number;
  rowsPerPageOptions?: number[];
  showCountInfo?: boolean;
}

const Pagination = (props: PaginationProps) => {
  const { className, onChangeRowsPerPage, onChangePage, page = 0, rowsPerPageOptions = defaultRowsPerPageOptions, showCountInfo, ...remainingProps } = props;
  // this is required due to the MUI tablepagination being 0-indexed, whereas we work with 1-indexed apis
  // running it without adjustment will lead to warnings from MUI
  const propsPage = Math.max(page - paginationIndex, 0);
  return (
    <TablePagination
      className={`flexbox margin-top ${className || ''}`}
      classes={{ spacer: 'flexbox no-basis' }}
      component="div"
      labelDisplayedRows={() => ''}
      labelRowsPerPage="Rows"
      slotProps={{ select: { name: 'pagination' } }}
      rowsPerPageOptions={rowsPerPageOptions}
      onRowsPerPageChange={e => onChangeRowsPerPage(Number(e.target.value))}
      page={propsPage}
      onPageChange={onChangePage}
      ActionsComponent={actionProps => <TablePaginationActions {...actionProps} showCountInfo={showCountInfo} />}
      {...remainingProps}
    />
  );
};

export const areEqual = (prevProps: PaginationProps, nextProps: PaginationProps) => {
  if (prevProps.page !== nextProps.page || prevProps.rowsPerPage !== nextProps.rowsPerPage || prevProps.disabled !== nextProps.disabled) {
    return false;
  }

  const pageStart = ((prevProps.page ?? 1) - 1) * (prevProps.rowsPerPage ?? defaultPerPage);
  const pageEnd = pageStart + (prevProps.rowsPerPage ?? defaultPerPage);

  return Math.min(prevProps.count, pageEnd) === Math.min(nextProps.count, pageEnd);
};

export default memo(Pagination, areEqual);
