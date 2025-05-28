import { CAlert } from '@coreui/react';

export default function AlertMessage({ color = 'info', message = '', className = '', ...props }) {
  if (!message) return null;
  return (
    <CAlert color={color} className={className} {...props}>
      {message}
    </CAlert>
  );
}