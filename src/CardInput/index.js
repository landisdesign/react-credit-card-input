import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import CardDisplay from 'react-credit-card-display';

import styles from './CardInput.module.scss';

/**
 *  Given the provided string, a pattern will be returned, based on the first
 *  character, as follows:
 *
 *  2,5,6: '#### #### #### ####'
 *  4: '#### #### #### #### ###'
 *  3: '#### ###### #####'
 *  Others: '###################'
 *
 *  These correspond to Mastercard and Discover; Visa (which can include the
 *  CVC depending on the bank); and American Express, respectively. If the
 *  first number isn't one of the ones described, 19 numbers are provided,
 *  representing the longest number available to a bank card.
 *
 *  This algorithm is looser than the algorithm for card definition, to permit
 *  potential formatting even if the card value isn't known yet (such as the
 *  case for Mastercard starting in 2 or Discover starting with 62).
 */
function getPatternFromNumber(number) {
  const patterns = {
    '0': '###################',
    '2': '#### #### #### ####',
    '3': '#### ###### #####',
    '4': '#### #### #### #### ###',
    '5': '#### #### #### ####',
    '6': '#### #### #### ####'
  }

  const firstDigit = ('' + number)[0] || '0';
  return patterns[firstDigit] || patterns['0'];
}

function isNumber(value) {
  return "0123456789".indexOf(value) !== -1
};

/**
 *  Given a number, selection start and selection end, returns them updated
 *  for the card format indicated by that number.
 */
function formatNumber({
  value,
  selectionStart = typeof value !== 'undefined'
    ? ('' + value).length
    : 0
  ,
  selectionEnd = selectionStart
}) {

  const processNumber = inCharacter => {
    return {
      outCharacter: inCharacter,
       // If the character is a space, not a number, it should not be included.
      addToOutput: isNumber(inCharacter),
      shiftInput: true // No matter what, we've processed this character.
    };
  };

  const processSpace = inCharacter => {
    return {
      outCharacter: ' ',
      addToOutput: true,
      // If the current character is a number, we should not move the input
      // forward while inserting the space, so that the next processNumber
      // takes care of it.
      shiftInput: !isNumber(inCharacter)
    };
  };

  const inputNumber = '' + value;
  const pattern = getPatternFromNumber(inputNumber);

  let outputNumber = [];
  let currentStart = selectionStart;
  let currentEnd = selectionEnd;
  let i = 0;
  let j = 0;

  while (i < inputNumber.length && j < pattern.length) {
    let inCharacter = inputNumber[i];
    let currentPattern = pattern[j];
    let outCharacter, addToOutput, shiftInput;

    if (currentPattern === '#') {
      ({outCharacter, addToOutput, shiftInput} = processNumber(inCharacter));
    }
    else {
      ({outCharacter, addToOutput, shiftInput} = processSpace(inCharacter));
    }

    if (addToOutput) {
      outputNumber[j] = outCharacter;
      j++;
    }

    if (shiftInput) {
      i++;
    }
    else {
      // Didn't process current inCharacter, which only happens when we are
      // processing a space. This means we added a character that wasn't part
      // of the original input. If the selection zone is after the current
      // character, we need to shift the selection zone to stay with the
      // characters that were input.
      if (i < currentStart) {
        currentStart++;
      }
      if (i < currentEnd) {
        currentEnd++;
      }
    }
  }

  return {
    value: outputNumber.join(''),
    selectionStart: currentStart,
    selectionEnd: currentEnd
  };
}

const maskProps = (props, mask) => Object.keys(mask).reduce((newProps, key) => {
  if (key in props) {
    newProps[key] = props[key];
  }
  return newProps;
}, {});

CardInput.propTypes = {
  /**
   *  If provided, the name attribute for the input
   */
  name: PropTypes.string,
  /**
   *  If provided, the id attribute for the input. Useful for <label htmlFor>
   */
  id: PropTypes.string,
  /**
   *  If provided, the initial value for the input. It will be stripped and
   *  formatted to follow the appropriate card format guidelines. Only numbers
   *  will be retained and spaces will be inserted or reinserted as necessary.
   */
  value: PropTypes.string,
  /**
   *  Any additional classes to add to the card input. Note that the following
   *  relevant CSS properties are already being used on this component:
   *
   *    background-color
   *    border
   *    display
   *    padding
   *
   *  Attempts to override these should include the `span` element as part of
   *  the selector to increase the specificity. The same caveat applies to the
   *  <input> field inside this component. It uses the following properties:
   *
   *    border
   *    font-size
   *
   *  The input and card icons are composed in em's and will adjust based upon
   *  the font size inherited from any component wrapping this component.
   */
  className: PropTypes.string,
  /**
   *  Any additional styles to be directly added to the wrapping element.
   */
  styles: PropTypes.object,
  /**
   *  If provided, a handler that is called whenver the data is changed in the
   *  field
   */
  onChange: PropTypes.func
}

// I'm explicitly not destructuring props because I do not want to set defaults for most missing attributes.
function CardInput(props) {

  const { value = '', onChange = ()=>{} } = props;

  const [ inputState, setInputState ] = useState(formatNumber({value}));

  const inputRef = useRef(null);
  const reversionData = useRef(null);

  function getReversionData(e) {
    const {value, selectionStart, selectionEnd} = e.target;

    reversionData.current = {
      selectionStart,
      selectionEnd,
      value,
      // only considered a replacement if a number is selected
      isReplacing: /\d/.test(value.substring(selectionStart, selectionEnd)),
      isAddingSpace: e.key === ' '
    };
  }

  function revertState(e, {value, selectionStart, selectionEnd}) {
    setInputState({
      value,
      selectionStart,
      selectionEnd
    });
    e.preventDefault();
  }

  function manageChange(e) {
    const input = e.target;
    const {value} = input;
    const originalInputData = reversionData.current;

    // This prevents bad characters. Also, if someone pastes in gibberish, we
    // aren't going to try to screen it, as that might cause unintented results.
    // By completely stopping the paste, we're providing stronger feedback.
    if (/[^0-9 ]/.test(value)) {
      revertState(e, originalInputData);
      return;
    }

    // If the field were already full, we aren't going to accept more data
    // unless the field had a selection that included numbers. Replacement is a
    // valid reason to take whatever is provided and reformat the number, even
    // if it is a large number pasted in. If the user pasted in replacement
    // numbers, they should be able to recognize what they did.
    const cardPattern = getPatternFromNumber(value);
    if ( (originalInputData.value.length === cardPattern.length) && (value.length >= cardPattern.length) && !originalInputData.isReplacing ) {
      revertState(e, originalInputData);
      return;
    }

    // We want to permit a person typing over a space, but not putting a space
    // where it doesn't belong.
    const {isAddingSpace, selectionStart} = originalInputData;
    if (isAddingSpace && cardPattern[selectionStart] !== ' ') {
      revertState(e, originalInputData);
      return;
    }

    const formattedData = formatNumber(input);
    setInputState(formattedData);
    if (inputState.value !== formattedData.value) {
      e.target.value = formattedData.value;
      onChange(e);
    }
  }

  // Need to wait for state change to process before updating selection
  // Otherwise selection data is erased when value is updated in rerender
  useEffect(() => {
    inputRef.current.selectionStart = inputState.selectionStart;
    inputRef.current.selectionEnd = inputState.selectionEnd;
  }, [inputState]);

  const spanAttrMask = {
    style: true,
    className: true
  };
  const spanAttrs = maskProps(props, spanAttrMask);
  spanAttrs.className = ('className' in spanAttrs)
    ? spanAttrs.className + ' ' + styles.input
    : styles.input
  ;

  const inputAttrMask = {
    id: true,
    name: true,
    size: true
  };
  const inputAttrs = maskProps(props, inputAttrMask);
  inputAttrs.size = inputAttrs.size || '25';

  return (
    <span {...spanAttrs}>
      <label className={styles.grid}>
        <span><input {...inputAttrs} value={inputState.value} onChange={manageChange} onKeyDown={getReversionData} ref={inputRef} /></span>
        <span className={styles.wrapper}><CardDisplay square={false} expand={true} number={inputState.value}/></span>
      </label>
    </span>
  );
}

export default CardInput;
export { getPatternFromNumber, formatNumber };