import { ErrorComponentProps } from '@tanstack/react-router';
import { FC } from 'react';

export const Error: FC<ErrorComponentProps> = ({ error }) => (
  <div className='flex h-dvh w-full items-center justify-center text-3xl text-red-400'>
    <div className='border border-red-400 p-4'>{error.message}</div>
  </div>
);
