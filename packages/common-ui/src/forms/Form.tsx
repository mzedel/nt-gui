// Copyright 2016 Northern.tech AS
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
import type { ReactNode, RefObject } from 'react';
import { useEffect } from 'react';
import type { FieldValues, Mode } from 'react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';

import { Button } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import validator from 'validator';

interface ValidationResult {
  errortext: string;
  isValid: boolean;
}

const validationMethods: Record<string, string> = {
  isAlpha: 'This field must contain only letters',
  isAlphanumeric: 'This field must contain only letters or numbers',
  isEmail: 'Please enter a valid email address',
  isHexadecimal: 'The secret has to be entered as a hexadecimal string',
  isNumeric: 'Please enter a valid code',
  isURL: 'Please enter a valid URL',
  isUUID: 'Please enter a valid ID'
};

const getErrorMsg = (validateMethod: string, args: string[]): string => {
  if (validationMethods[validateMethod]) {
    return validationMethods[validateMethod];
  }
  switch (validateMethod) {
    case 'isLength':
      if (Number(args[0]) === 1) {
        return 'This field is required';
      } else if (Number(args[0]) > 1) {
        return `Must be at least ${args[0]} characters long`;
      }
      break;
    case 'isAlphanumericLocator':
      if (args[0] && validator.matches(args[0], /^[a-zA-Z0-9_-]+$/)) {
        return '';
      } else {
        return 'This please only enter valid characters. Valid characters are a-z, A-Z, 0-9, _ and -';
      }
    case 'isNot':
      if (args[0] === args[1]) {
        return `This field should have a value other than ${args[0]}`;
      }
      break;
    default:
      return 'There is an error with this field';
  }
  return '';
};

const tryApplyValidationEntry = (value: string, validations: string[] = [], validationResults: ValidationResult[] = []): ValidationResult => {
  const validation = validations.shift();
  if (!validation) {
    return validationResults.pop()!;
  }
  let args = validation.split(':');
  const validateMethod = args.shift()!;
  const tmpArgs = args;
  // We then merge two arrays, ending up with the value
  // to pass first, then options, if any. ['valueFromInput', 5]
  args = [value].concat(args);
  try {
    // So the next line of code is actually:
    // validator.isLength('valueFromInput', 5)
    if (!validator[validateMethod](...args)) {
      return tryApplyValidationEntry(value, validations, [...validationResults, { errortext: getErrorMsg(validateMethod, tmpArgs), isValid: false }]);
    }
  } catch {
    const errortext = getErrorMsg(validateMethod, args) || '';
    return tryApplyValidationEntry(value, validations, [...validationResults, { errortext, isValid: !errortext }]);
  }
  return { errortext: '', isValid: true };
};

const tryApplyValidations = (value: string, validations: string, initialValidationResult: ValidationResult): ValidationResult =>
  validations.split(',').reduce((accu: ValidationResult, validation: string) => {
    if (!accu.isValid || !validation) {
      return accu;
    }
    const alternatives = validation.split('||');
    return tryApplyValidationEntry(value, alternatives, [accu]);
  }, initialValidationResult);

interface PasswordValidationInput {
  errortext: string;
  isValid: boolean;
  required: boolean;
  validations: string;
  value: string;
}

const runPasswordValidations = ({ required, value, validations, isValid, errortext }: PasswordValidationInput): ValidationResult => {
  if (required && !value) {
    return { isValid: false, errortext: 'Password is required' };
  } else if (required || value) {
    const { isValid: validatedIsValid, errortext: validatedErrortext } = tryApplyValidations(value, validations, { isValid, errortext });
    return { isValid: validatedIsValid, errortext: !validatedIsValid ? (validatedErrortext ? validatedErrortext : 'Password too weak') : errortext };
  }
  return { isValid, errortext };
};

interface RunValidationsInput {
  id?: string;
  required: boolean;
  validations: string;
  value: string;
  wasMaybeTouched?: boolean;
}

export const runValidations = ({ required, value, id, validations, wasMaybeTouched }: RunValidationsInput): ValidationResult => {
  const isValid = true;
  const errortext = '';
  if (id && id.includes('password')) {
    return runPasswordValidations({ required, value, validations, isValid, errortext });
  } else {
    if (value || required || (wasMaybeTouched && validations.includes('isLength:1'))) {
      return tryApplyValidations(validations.includes('trim') ? value.trim() : value, validations, { isValid, errortext });
    }
  }
  return { isValid, errortext };
};

const useStyles = makeStyles()(theme => ({
  buttonWrapper: { display: 'flex', justifyContent: 'flex-end', height: 'min-content', marginTop: theme.spacing(4) },
  cancelButton: { marginRight: theme.spacing() }
}));

interface FormProps<T extends FieldValues = FieldValues> {
  autocomplete?: string;
  buttonColor?: 'primary' | 'secondary' | 'inherit' | 'error' | 'info' | 'success' | 'warning';
  children: ReactNode;
  classes?: { buttonWrapper?: string; cancelButton?: string };
  className?: string;
  defaultValues?: T;
  handleCancel?: () => void;
  id?: string;
  initialValues?: Partial<T>;
  onSubmit: (data: T) => void | Promise<void>;
  showButtons?: boolean;
  submitLabel?: string;
  submitRef?: RefObject<(() => void) | null>;
  validationMode?: Mode;
}

export const Form = ({
  autocomplete,
  buttonColor,
  children,
  className = '',
  classes = { buttonWrapper: '', cancelButton: '' },
  defaultValues = {},
  handleCancel,
  id,
  initialValues = {},
  onSubmit,
  showButtons,
  submitLabel,
  submitRef,
  validationMode = 'onChange'
}: FormProps) => {
  const { classes: internalClasses } = useStyles();
  const methods = useForm({ mode: validationMode, defaultValues });
  const {
    handleSubmit,
    formState: { isValid },
    setValue
  } = methods;

  useEffect(() => {
    if (submitRef) {
      submitRef.current = handleSubmit(onSubmit);
    }
  }, [handleSubmit, onSubmit, submitRef]);
  useEffect(() => {
    Object.entries(initialValues).forEach(([key, value]) => setValue(key, value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialValues), setValue]);

  return (
    <FormProvider {...methods}>
      <form autoComplete={autocomplete} className={className} id={id} noValidate onSubmit={handleSubmit(onSubmit)}>
        {children}
        {!!showButtons && (
          <div className={`button-wrapper ${internalClasses.buttonWrapper} ${classes.buttonWrapper}`}>
            {!!handleCancel && (
              <Button className={`${internalClasses.cancelButton} ${classes.cancelButton}`} key="cancel" onClick={handleCancel}>
                Cancel
              </Button>
            )}
            <Button variant="contained" type="submit" disabled={!isValid && validationMode !== 'onSubmit'} color={buttonColor}>
              {submitLabel}
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
};

export default Form;
