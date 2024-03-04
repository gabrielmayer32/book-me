// DateTimePickerComponent.js
import React from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const DateTimePickerComponent = ({ isVisible, mode, onConfirm, onCancel }) => (
  <DateTimePickerModal isVisible={isVisible} mode={mode} onConfirm={onConfirm} onCancel={onCancel} />
);

export default DateTimePickerComponent;
