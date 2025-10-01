// Copyright 2020 Northern.tech AS
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
import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';

import CopyToClipboard from './CopyToClipboard';

import { FileCopy as CopyPasteIcon } from '@mui/icons-material';
import { Button, IconButton } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { TIMEOUTS } from '@northern.tech/store/constants';

const useStyles = makeStyles()(theme => ({
  button: { float: 'right', marginRight: theme.spacing(-2), marginTop: theme.spacing(-0.25) },
  code: {
    // @ts-expect-error: lightgrey is only present in the old theme
    backgroundColor: theme.palette.background.lightgrey ? theme.palette.background.lightgrey : theme.palette.grey[100],
    fontFamily: 'monospace',
    borderRadius: theme.spacing(0.5),
    padding: theme.spacing(2),
    overflowY: 'auto',
    position: 'relative',
    whiteSpace: 'pre-line',
    '.copyable-content': {
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    }
  }
}));

interface CodeProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const Code = ({ className = '', children, style = {} }: CodeProps) => {
  const { classes } = useStyles();
  return (
    <div className={`${classes.code} ${className}`} style={style}>
      {children}
    </div>
  );
};

interface CopyCodeProps {
  code: string;
  onCopy?: () => void;
  withDescription?: boolean;
}

export const CopyCode = ({ code, onCopy, withDescription }: CopyCodeProps) => {
  const [copied, setCopied] = useState(false);
  const { classes } = useStyles();

  const onCopied = (_text: string, result: boolean) => {
    setCopied(result);
    setTimeout(() => setCopied(false), TIMEOUTS.fiveSeconds);
    if (onCopy) {
      onCopy();
    }
  };

  return (
    <>
      <Code>
        <CopyToClipboard text={code} onCopy={onCopied}>
          {withDescription ? (
            <Button className={classes.button} startIcon={<CopyPasteIcon />} title="Copy to clipboard">
              Copy to clipboard
            </Button>
          ) : (
            <IconButton className={classes.button} size="large" title="Copy to clipboard">
              <CopyPasteIcon />
            </IconButton>
          )}
        </CopyToClipboard>
        <span className="copyable-content">{code}</span>
      </Code>
      <p>{copied && <span className="green fadeIn">Copied to clipboard.</span>}</p>
    </>
  );
};

export default CopyCode;
