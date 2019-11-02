# react-credit-card-input

A React component for formatting and identifying credit card text input.

Import with

```js
import CardInput from 'react-credit-card-input';
```

and use it like

```jsx
<CardInput value="4321 0987 6543 2109" onChange={changeHandler} />
```

A text field will be presented that includes a line of credit cards to the right. As the user enters or updates the number, spaces will be added where necessary to reflect how the number would appear on a card, and the appropriate card icon will be highlighted.

## Usage

`react-credit-card-input` has the React Component, and two helper functions for formatting.

```js
import CardInput from 'react-credit-card-input';
```
Imports the CardInput React component


```js
import { getPatternFromNumber, formatNumber } from 'react-credit-card-display';
```
Imports the `getPatternFromNumber` and `formatNumber` functions

### &lt;CardInput/>
The CardInput React component has several attributes for identifying, styling and managing the input.

```jsx
<CardInput [name='name'] [id='id'] [value='value'] [onChange={onChangeHandler}] [style={ {styleObj} }] [className='className'] />
```

#### `name`

The underlying input field's name attribute. This can be useful if you are letting the HTML submit the form, versus doing AJAX submission from state.

#### `id`

The underlying input field's id attribute. This can be useful if you plan to tie $lt;label> tags to the field, for example.

#### `value`

The value to populate the field with. Any non-numbers will be stripped, and the entire number will be reformatted according to the type of credit card determined by the first number in the value.

#### `onChange`

If provided, this will be called whenever the value is changed.

#### `style`

A standard React CSS style object. If provided, the styles will impact the visible input wrapper, not the input field within the wrapper.

#### `className`

A CSS class to be added to the visible input wrapper. Please see [Styling &lt;CardInput/>](#styling) below for details on using this.

### getPatternFromNumber(number)
Used by <CardInput/> to identify how the provided number should be formatted.

#### `number`

The string value to be read to determine the appropriate formatting pattern. The pattern returned is a combination of spaces and #, such as `#### #### #### ####` for a 16-digit number separated by spaces into groups of 4.

If the provided value is not a number, or the first character doesn't match a number recognized as belong to Visa, MasterCard, American Express or Discover, this method returns a pattern representing a single group 19 digits, the longest number permitted by today's cards.

Note that in some cases the format is guessed prior to being able to determine the actual card type. This is because not all cards can be determined by just the first number, but we don't want to change the format underneath the user by waiting for what in some cases requires 5 digits for a certain match. See [`react-credit-card-display`](https://github.com/landisdesign/react-credit-card-display) for more details on the card type algorithm.

### formatNumber( {value, selectionStart, selectionEnd} )
Given an arbitrarily spaced number, returns the number, properly formatted, with the caret position updated if necessary. A new object is returned, with new `value`, `selectionStart` and `selectionEnd` values. This input/output structure is intended to simplify retrieval from an HTMLInputElement and reinsertion of the updated information.

#### `value`

The value to be formatted. If there are any non-numeric characters, they will be ignored. If not provided, or if no characters are numbers, the returned value will be an empty string.

#### `selectionStart`

The index where the selection begins. This reflects selectionStart as provided by an input. See the definition of `selectionStart` at [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement).

#### `selectionEnd`

The index where the selection ends. This reflects selectionEnd as provided by an input. See the definition of `selectionEnd` at [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement).

## <a name="styling"></a>Styling &lt;CardInput/>

When adding a `className` attribute to a &lt;CardInput/> component, you will be competing with existing styles. The provided class will be added to the wrapping `span` element alongside the existing class for the component. Any properties applied to a simple class selector may or may not override the default properties.

To override the built-in properties, be sure to define your properties using a selector that includes the span, such as

```css
span.my-class {
	border: 1px solid red;
	...
}
```

These properties will override the ones provided for the wrapper.

If you want to override any properties for the actual input field inside the wrapper, such as font families or sizes, you can access the input via

```css
span.my-class input {
	font-family: sans-serif;
}
```

The internal input field will not be styled by adding a `style` attribute to the &lt;CardInput/> component.

__The card display section of the input cannot be compressed.__ Keep this in mind if you want to define flexible input widths etc.

## Behavior Notes

For the most part, the input behaves as you would expect:

- Typing numbers automatically adds spaces as required.
- Deleting a number after a space deletes the space as well.
- Typing a space when there shouldn't be one does nothing. Typing one where there should be one adds the space.
- Typing anything other than a number or space does nothing.

Where things more interesting is when pasting in clipboard entries.

- If anything in the clipboard includes a non-number/non-space, pasting does nothing. CardInput assumes that if it isn't just numbers, you probably didn't mean to paste it into a credit card field.
- If you attempt to paste numbers into an already full field, the numbers won't be pasted in. It's full.
- If you've selected a range of characters in the field, however, the paste takes place, and the field is reformatted.

## Requirements

CardInput uses React Hooks and therefore has peer dependencies to `react^16.8.0` and `react-dom^16.8.0`. It also relies on `prop-types^15.6.0`.

CardInput internally uses `react-credit-card-display` version 0.5.2.

## License info

This project is licensed under a MIT license, found [here](./LICENSE.md).
